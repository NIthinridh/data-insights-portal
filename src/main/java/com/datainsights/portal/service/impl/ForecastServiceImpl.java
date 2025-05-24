package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.TransactionRepository;
import com.datainsights.portal.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ForecastServiceImpl implements ForecastService {

    private final TransactionRepository transactionRepository;

    @Override
    public List<Map<String, Object>> generateForecast(User user, int months) {
        // Get historical transactions for the user using user ID
        List<Transaction> transactions = transactionRepository.findByCreatedBy(user.getId());

        if (transactions.isEmpty()) {
            return generateDefaultForecast(months);
        }

        // Analyze historical data
        Map<String, List<Transaction>> transactionsByMonth = transactions.stream()
                .collect(Collectors.groupingBy(t ->
                        YearMonth.from(t.getDate()).toString()
                ));

        // Calculate average income and expenses
        double averageMonthlyIncome = calculateAverageMonthlyIncome(transactionsByMonth);
        double averageMonthlyExpenses = calculateAverageMonthlyExpenses(transactionsByMonth);

        // Generate forecast based on historical data
        List<Map<String, Object>> forecastData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            // Apply slight growth trend
            double trendFactor = 1.0 + (0.002 * i); // 0.2% growth per month
            double projectedIncome = averageMonthlyIncome * trendFactor;
            double projectedExpenses = averageMonthlyExpenses * trendFactor;

            // Apply seasonal adjustments
            int month = forecastDate.getMonthValue();
            if (month == 12) { // December
                projectedExpenses *= 1.2; // 20% higher expenses
            } else if (month == 1) { // January
                projectedExpenses *= 0.9; // 10% lower expenses
            }

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("income", Math.round(projectedIncome * 100.0) / 100.0);
            monthData.put("expenses", Math.round(projectedExpenses * 100.0) / 100.0);
            monthData.put("savings", Math.round((projectedIncome - projectedExpenses) * 100.0) / 100.0);

            forecastData.add(monthData);
        }

        return forecastData;
    }

    @Override
    public List<Map<String, Object>> generateIncomeProjection(User user, int months) {
        List<Transaction> incomeTransactions = transactionRepository
                .findIncomeTransactionsByUser(user.getId());

        if (incomeTransactions.isEmpty()) {
            return generateDefaultIncomeProjection(months);
        }

        // Group by category to analyze income sources
        Map<String, BigDecimal> incomeByCategory = incomeTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);

            double totalIncome = 0;
            for (Map.Entry<String, BigDecimal> entry : incomeByCategory.entrySet()) {
                String category = entry.getKey();
                double baseAmount = entry.getValue().doubleValue() / incomeTransactions.size();
                double projectedAmount = baseAmount * (1.0 + (0.002 * i));

                monthData.put(category != null ? category.toLowerCase() : "other", Math.round(projectedAmount * 100.0) / 100.0);
                totalIncome += projectedAmount;
            }

            monthData.put("total", Math.round(totalIncome * 100.0) / 100.0);
            projectionData.add(monthData);
        }

        return projectionData;
    }

    @Override
    public List<Map<String, Object>> generateExpenseProjection(User user, int months) {
        List<Transaction> expenseTransactions = transactionRepository
                .findExpenseTransactionsByUser(user.getId());

        if (expenseTransactions.isEmpty()) {
            return generateDefaultExpenseProjection(months);
        }

        // Group by category - note: for expenses, we need absolute values
        Map<String, BigDecimal> expensesByCategory = expenseTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO,
                                t -> t.getAmount().abs(), // Convert to absolute value for expenses
                                BigDecimal::add)
                ));

        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);

            double totalExpenses = 0;
            for (Map.Entry<String, BigDecimal> entry : expensesByCategory.entrySet()) {
                String category = entry.getKey();
                double baseAmount = entry.getValue().doubleValue() / expenseTransactions.size();
                double projectedAmount = baseAmount * (1.0 + (0.002 * i));

                // Apply seasonal adjustments for specific categories
                int month = forecastDate.getMonthValue();
                if (category != null && category.equalsIgnoreCase("Shopping") && (month == 11 || month == 12)) {
                    projectedAmount *= 1.3; // 30% higher during holidays
                }

                monthData.put(category != null ? category.toLowerCase() : "other", Math.round(projectedAmount * 100.0) / 100.0);
                totalExpenses += projectedAmount;
            }

            monthData.put("total", Math.round(totalExpenses * 100.0) / 100.0);
            projectionData.add(monthData);
        }

        return projectionData;
    }

    @Override
    public List<Map<String, Object>> generateSavingsProjection(User user, int months) {
        List<Transaction> transactions = transactionRepository.findByCreatedBy(user.getId());

        if (transactions.isEmpty()) {
            return generateDefaultSavingsProjection(months);
        }

        List<Transaction> incomeTransactions = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        List<Transaction> expenseTransactions = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.toList());

        double averageMonthlyIncome = calculateAverageMonthlyIncome(incomeTransactions);
        double averageMonthlyExpenses = calculateAverageMonthlyExpenses(expenseTransactions);

        double currentSavings = averageMonthlyIncome - averageMonthlyExpenses;
        double cumulativeSavings = currentSavings * 3; // Assume 3 months of savings

        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            double trendFactor = 1.0 + (0.002 * i);
            double projectedSavings = currentSavings * trendFactor;

            // Apply seasonal adjustments
            int month = forecastDate.getMonthValue();
            if (month == 12) {
                projectedSavings *= 0.7; // Lower savings in December
            } else if (month == 1) {
                projectedSavings *= 1.2; // Higher savings in January
            }

            double interestEarned = cumulativeSavings * 0.002; // 0.2% monthly interest
            cumulativeSavings += projectedSavings + interestEarned;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("monthlySavings", Math.round(projectedSavings * 100.0) / 100.0);
            monthData.put("interestEarned", Math.round(interestEarned * 100.0) / 100.0);
            monthData.put("totalSavings", Math.round(cumulativeSavings * 100.0) / 100.0);

            projectionData.add(monthData);
        }

        return projectionData;
    }

    @Override
    public Map<String, Object> generateCustomForecast(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByCreatedBy(user.getId());

        if (transactions.isEmpty()) {
            return generateDefaultCustomForecast(startDate, endDate);
        }

        long monthsBetween = startDate.until(endDate).toTotalMonths() + 1;

        List<Transaction> incomeTransactions = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        List<Transaction> expenseTransactions = transactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.toList());

        double averageMonthlyIncome = calculateAverageMonthlyIncome(incomeTransactions);
        double averageMonthlyExpenses = calculateAverageMonthlyExpenses(expenseTransactions);

        // Project totals
        double totalIncome = averageMonthlyIncome * monthsBetween;
        double totalExpenses = averageMonthlyExpenses * monthsBetween;
        double totalSavings = totalIncome - totalExpenses;
        double savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

        Map<String, Object> forecastSummary = new HashMap<>();
        forecastSummary.put("startDate", startDate.toString());
        forecastSummary.put("endDate", endDate.toString());
        forecastSummary.put("months", monthsBetween);
        forecastSummary.put("totalIncome", Math.round(totalIncome * 100.0) / 100.0);
        forecastSummary.put("totalExpenses", Math.round(totalExpenses * 100.0) / 100.0);
        forecastSummary.put("totalSavings", Math.round(totalSavings * 100.0) / 100.0);
        forecastSummary.put("savingsRate", Math.round(savingsRate * 10.0) / 10.0);

        return forecastSummary;
    }

    // Helper methods
    private double calculateAverageMonthlyIncome(Map<String, List<Transaction>> transactionsByMonth) {
        if (transactionsByMonth.isEmpty()) return 0.0;

        return transactionsByMonth.values().stream()
                .mapToDouble(monthTransactions ->
                        monthTransactions.stream()
                                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .doubleValue()
                )
                .average()
                .orElse(0.0);
    }

    private double calculateAverageMonthlyExpenses(Map<String, List<Transaction>> transactionsByMonth) {
        if (transactionsByMonth.isEmpty()) return 0.0;

        return transactionsByMonth.values().stream()
                .mapToDouble(monthTransactions ->
                        monthTransactions.stream()
                                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                                .map(t -> t.getAmount().abs())
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .doubleValue()
                )
                .average()
                .orElse(0.0);
    }

    private double calculateAverageMonthlyIncome(List<Transaction> transactions) {
        if (transactions.isEmpty()) return 0.0;

        Map<YearMonth, BigDecimal> incomeByMonth = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return incomeByMonth.values().stream()
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
    }

    private double calculateAverageMonthlyExpenses(List<Transaction> transactions) {
        if (transactions.isEmpty()) return 0.0;

        Map<YearMonth, BigDecimal> expensesByMonth = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.reducing(BigDecimal.ZERO,
                                t -> t.getAmount().abs(),
                                BigDecimal::add)
                ));

        return expensesByMonth.values().stream()
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
    }

    // Default forecast methods for users with no transaction history
    private List<Map<String, Object>> generateDefaultForecast(int months) {
        List<Map<String, Object>> forecastData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("income", 0.0);
            monthData.put("expenses", 0.0);
            monthData.put("savings", 0.0);

            forecastData.add(monthData);
        }

        return forecastData;
    }

    private List<Map<String, Object>> generateDefaultIncomeProjection(int months) {
        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("total", 0.0);

            projectionData.add(monthData);
        }

        return projectionData;
    }

    private List<Map<String, Object>> generateDefaultExpenseProjection(int months) {
        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("total", 0.0);

            projectionData.add(monthData);
        }

        return projectionData;
    }

    private List<Map<String, Object>> generateDefaultSavingsProjection(int months) {
        List<Map<String, Object>> projectionData = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();

        for (int i = 1; i <= months; i++) {
            LocalDate forecastDate = currentDate.plusMonths(i);
            String monthName = forecastDate.format(DateTimeFormatter.ofPattern("MMM yyyy"));

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("monthlySavings", 0.0);
            monthData.put("interestEarned", 0.0);
            monthData.put("totalSavings", 0.0);

            projectionData.add(monthData);
        }

        return projectionData;
    }

    private Map<String, Object> generateDefaultCustomForecast(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> forecastSummary = new HashMap<>();
        long monthsBetween = startDate.until(endDate).toTotalMonths() + 1;

        forecastSummary.put("startDate", startDate.toString());
        forecastSummary.put("endDate", endDate.toString());
        forecastSummary.put("months", monthsBetween);
        forecastSummary.put("totalIncome", 0.0);
        forecastSummary.put("totalExpenses", 0.0);
        forecastSummary.put("totalSavings", 0.0);
        forecastSummary.put("savingsRate", 0.0);

        return forecastSummary;
    }
}