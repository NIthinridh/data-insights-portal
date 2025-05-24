package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.FinancialData;
import com.datainsights.portal.model.mongo.AnalyticsResult;
import com.datainsights.portal.repository.FinancialDataRepository;
import com.datainsights.portal.repository.mongo.AnalyticsResultRepository;
import com.datainsights.portal.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of the Analytics Service
 */
@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    private final FinancialDataRepository financialDataRepository;
    private final AnalyticsResultRepository analyticsResultRepository;

    public AnalyticsServiceImpl(FinancialDataRepository financialDataRepository,
                                AnalyticsResultRepository analyticsResultRepository) {
        this.financialDataRepository = financialDataRepository;
        this.analyticsResultRepository = analyticsResultRepository;
    }

    @Override
    public Map<String, Object> getFinancialSummary(LocalDate startDate, LocalDate endDate, Authentication authentication) {
        logger.info("Generating financial summary from {} to {}", startDate, endDate);

        Long userId = getUserIdFromAuthentication(authentication);

        // Fetch financial data for the specified date range
        List<FinancialData> financialData = financialDataRepository.findByTransactionDateBetweenAndCreatedBy(
                startDate, endDate, userId);

        logger.info("Found {} transactions for summary analysis", financialData.size());

        // Calculate totals
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        for (FinancialData data : financialData) {
            BigDecimal amount = data.getAmount();

            if (amount.compareTo(BigDecimal.ZERO) > 0) {
                // Positive amount = income
                totalIncome = totalIncome.add(amount);
            } else {
                // Negative amount = expense
                totalExpenses = totalExpenses.add(amount.abs());
            }
        }

        // Calculate balance and savings rate
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = BigDecimal.ZERO;

        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = balance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        // Create result map
        Map<String, Object> summary = new HashMap<>();
        summary.put("startDate", startDate.toString());
        summary.put("endDate", endDate.toString());
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("balance", balance);
        summary.put("savingsRate", savingsRate);
        summary.put("transactionCount", financialData.size());

        // Save the analysis result
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("startDate", startDate.toString());
        parameters.put("endDate", endDate.toString());

        saveAnalyticsResult("SUMMARY", parameters, summary, authentication);

        return summary;
    }

    @Override
    public Map<String, Object> getCategoryBreakdown(LocalDate startDate, LocalDate endDate, Authentication authentication) {
        logger.info("Generating category breakdown from {} to {}", startDate, endDate);

        Long userId = getUserIdFromAuthentication(authentication);

        // Fetch financial data for the specified date range
        List<FinancialData> financialData = financialDataRepository.findByTransactionDateBetweenAndCreatedBy(
                startDate, endDate, userId);

        logger.info("Found {} transactions for category analysis", financialData.size());

        // Group by category and calculate totals
        Map<String, BigDecimal> categoryTotals = new HashMap<>();

        for (FinancialData data : financialData) {
            // Skip income entries (positive amounts)
            if (data.getAmount().compareTo(BigDecimal.ZERO) >= 0) {
                continue;
            }

            String category = data.getCategory();
            if (category == null || category.isEmpty()) {
                category = "Uncategorized";
            }

            BigDecimal amount = data.getAmount().abs();

            // Update category total
            categoryTotals.put(category,
                    categoryTotals.getOrDefault(category, BigDecimal.ZERO).add(amount));
        }

        // Calculate the total amount for percentages
        BigDecimal totalAmount = categoryTotals.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create result with percentage for each category
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", startDate.toString());
        result.put("endDate", endDate.toString());

        Map<String, Object> categories = new HashMap<>();
        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("amount", entry.getValue());

            BigDecimal percentage = BigDecimal.ZERO;
            if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                percentage = entry.getValue()
                        .divide(totalAmount, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
            }

            categoryData.put("percentage", percentage);
            categories.put(entry.getKey(), categoryData);
        }

        result.put("categories", categories);
        result.put("total", totalAmount);

        // Save the analysis result
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("startDate", startDate.toString());
        parameters.put("endDate", endDate.toString());

        saveAnalyticsResult("CATEGORY", parameters, result, authentication);

        return result;
    }

    @Override
    public List<Map<String, Object>> getFinancialTrends(LocalDate startDate, LocalDate endDate,
                                                        String interval, Authentication authentication) {
        logger.info("Generating financial trends from {} to {} with interval {}", startDate, endDate, interval);

        Long userId = getUserIdFromAuthentication(authentication);

        // Fetch financial data for the specified date range
        List<FinancialData> financialData = financialDataRepository.findByTransactionDateBetweenAndCreatedBy(
                startDate, endDate, userId);

        logger.info("Found {} transactions for trend analysis", financialData.size());

        // Group data by interval
        Map<String, List<FinancialData>> groupedData = groupByInterval(financialData, interval);

        // Calculate totals for each interval
        List<Map<String, Object>> trends = new ArrayList<>();

        for (Map.Entry<String, List<FinancialData>> entry : groupedData.entrySet()) {
            String intervalKey = entry.getKey();
            List<FinancialData> intervalData = entry.getValue();

            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expenses = BigDecimal.ZERO;

            for (FinancialData data : intervalData) {
                BigDecimal amount = data.getAmount();

                if (amount.compareTo(BigDecimal.ZERO) > 0) {
                    income = income.add(amount);
                } else {
                    expenses = expenses.add(amount.abs());
                }
            }

            BigDecimal balance = income.subtract(expenses);

            Map<String, Object> intervalResult = new HashMap<>();
            intervalResult.put("interval", intervalKey);
            intervalResult.put("income", income);
            intervalResult.put("expenses", expenses);
            intervalResult.put("balance", balance);

            trends.add(intervalResult);
        }

        // Sort by interval
        trends.sort(Comparator.comparing(m -> (String) m.get("interval")));

        // Save the analysis result
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("startDate", startDate.toString());
        parameters.put("endDate", endDate.toString());
        parameters.put("interval", interval);

        Map<String, Object> results = new HashMap<>();
        results.put("trends", trends);

        saveAnalyticsResult("TREND", parameters, results, authentication);

        return trends;
    }

    @Override
    public AnalyticsResult saveAnalyticsResult(String type, Map<String, Object> parameters,
                                               Map<String, Object> results, Authentication authentication) {
        // Create a new analytics result
        AnalyticsResult analyticsResult = new AnalyticsResult();
        analyticsResult.setType(type);
        analyticsResult.setCreatedAt(LocalDateTime.now());
        analyticsResult.setCreatedBy(getUserIdFromAuthentication(authentication));
        analyticsResult.setParameters(parameters);
        analyticsResult.setResults(results);

        // Save to MongoDB
        return analyticsResultRepository.save(analyticsResult);
    }

    @Override
    public List<AnalyticsResult> getAnalyticsHistory(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        return analyticsResultRepository.findByCreatedByOrderByCreatedAtDesc(userId);
    }

    /**
     * Group financial data by time interval (daily, weekly, monthly)
     */
    private Map<String, List<FinancialData>> groupByInterval(List<FinancialData> data, String interval) {
        Map<String, List<FinancialData>> groupedData = new HashMap<>();

        DateTimeFormatter dailyFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter weeklyFormatter = DateTimeFormatter.ofPattern("yyyy-'W'ww");
        DateTimeFormatter monthlyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (FinancialData item : data) {
            LocalDate date = item.getTransactionDate();
            String key;

            switch (interval.toLowerCase()) {
                case "weekly":
                    key = date.format(weeklyFormatter);
                    break;
                case "monthly":
                    key = date.format(monthlyFormatter);
                    break;
                case "daily":
                default:
                    key = date.format(dailyFormatter);
                    break;
            }

            // Add to the appropriate group
            if (!groupedData.containsKey(key)) {
                groupedData.put(key, new ArrayList<>());
            }

            groupedData.get(key).add(item);
        }

        return groupedData;
    }

    /**
     * Extract user ID from Authentication object
     * Note: This is a simplified implementation. In a real application,
     * you would extract the user ID from your custom UserDetails implementation.
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        // For testing purposes, using a fixed user ID
        return 1L;
    }
}
