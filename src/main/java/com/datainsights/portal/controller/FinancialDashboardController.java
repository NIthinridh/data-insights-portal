package com.datainsights.portal.controller;

import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.TransactionRepository;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class FinancialDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(FinancialDashboardController.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetService budgetService;

    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @RequestParam(defaultValue = "month") String timeframe,
            Authentication authentication) {

        logger.info("Fetching dashboard summary data for timeframe: {} and user: {}",
                timeframe, authentication.getName());

        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();

            // Calculate date range based on timeframe
            LocalDate endDate = LocalDate.now();
            LocalDate startDate;

            switch (timeframe) {
                case "week":
                    startDate = endDate.minusWeeks(1);
                    break;
                case "year":
                    startDate = endDate.minusYears(1);
                    break;
                case "month":
                default:
                    startDate = endDate.minusMonths(1);
                    break;
            }

            // Get transaction data
            BigDecimal totalIncome = transactionRepository.sumIncomeByUserAndDateRange(
                    userId, startDate, endDate);
            BigDecimal totalExpenses = transactionRepository.sumExpensesByUserAndDateRange(
                    userId, startDate, endDate);

            int transactionCount = transactionRepository.countByCreatedByAndDateBetween(
                    userId, startDate, endDate);

            // List of transactions for this period
            List<Transaction> transactions = transactionRepository
                    .findByCreatedByAndDateBetween(userId, startDate, endDate);

            // Calculate average transaction size
            BigDecimal avgTransaction = BigDecimal.ZERO;
            if (transactionCount > 0) {
                BigDecimal totalAmount = transactions.stream()
                        .map(Transaction::getAmount)
                        .map(BigDecimal::abs)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                avgTransaction = totalAmount.divide(
                        BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP);
            }

            // Recent imports (assuming this is the number of unique import jobs)
            int recentImports = transactions.stream()
                    .filter(t -> t.getImportId() != null)
                    .map(Transaction::getImportId)
                    .collect(Collectors.toSet())
                    .size();

            // Calculate balance and savings rate
            BigDecimal balance = totalIncome.subtract(totalExpenses);
            BigDecimal savingsRate = BigDecimal.ZERO;

            if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                savingsRate = balance.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
            }

            // Build response
            Map<String, Object> summaryData = new HashMap<>();
            summaryData.put("totalTransactions", transactionCount);
            summaryData.put("totalAmount", balance);
            summaryData.put("avgTransaction", avgTransaction);
            summaryData.put("recentImports", recentImports);
            summaryData.put("income", totalIncome);
            summaryData.put("expenses", totalExpenses);
            summaryData.put("balance", balance);
            summaryData.put("savingsRate", savingsRate.setScale(1, RoundingMode.HALF_UP));

            logger.info("Dashboard summary data successfully fetched with {} transactions", transactionCount);
            return ResponseEntity.ok(summaryData);

        } catch (Exception e) {
            logger.error("Error fetching dashboard summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to load dashboard summary: " + e.getMessage()));
        }
    }

    @GetMapping("/transactions/monthly-summary")
    public ResponseEntity<?> getTransactionsByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication authentication) {

        logger.info("Fetching monthly transactions for year: {}, month: {}, user: {}",
                year, month, authentication.getName());

        try {
            // Default to current year/month if not specified
            LocalDate now = LocalDate.now();
            if (year == null) year = now.getYear();
            if (month == null) month = now.getMonthValue();

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();

            // Calculate start and end date for the month
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.plusMonths(1).minusDays(1);

            // Get all transactions for the month
            List<Transaction> monthlyTransactions = transactionRepository
                    .findByCreatedByAndDateBetween(userId, startDate, endDate);

            // Group by week
            List<Map<String, Object>> weeklyData = new ArrayList<>();

            // Create a map to hold data for each week
            Map<Integer, List<Transaction>> weekMap = new HashMap<>();

            // Group transactions by week
            for (Transaction tx : monthlyTransactions) {
                // Calculate week of month (1-indexed)
                int weekOfMonth = (tx.getDate().getDayOfMonth() - 1) / 7 + 1;

                if (!weekMap.containsKey(weekOfMonth)) {
                    weekMap.put(weekOfMonth, new ArrayList<>());
                }

                weekMap.get(weekOfMonth).add(tx);
            }

            // Process each week's data
            for (int week = 1; week <= 5; week++) { // Up to 5 weeks in a month
                List<Transaction> weekTransactions = weekMap.getOrDefault(week, new ArrayList<>());

                if (weekTransactions.isEmpty() && week > 4) {
                    // Skip empty 5th week
                    continue;
                }

                BigDecimal income = weekTransactions.stream()
                        .filter(tx -> tx.getAmount().compareTo(BigDecimal.ZERO) > 0)
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal expenses = weekTransactions.stream()
                        .filter(tx -> tx.getAmount().compareTo(BigDecimal.ZERO) < 0)
                        .map(Transaction::getAmount)
                        .map(BigDecimal::abs)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Calculate net amount (income - expenses)
                BigDecimal amount = income.subtract(expenses);

                Map<String, Object> weekData = new HashMap<>();
                weekData.put("period", "Week " + week);
                weekData.put("amount", amount);
                weekData.put("income", income);
                weekData.put("expenses", expenses);

                weeklyData.add(weekData);
            }

            logger.info("Successfully fetched monthly transaction summary with {} weeks of data", weeklyData.size());
            return ResponseEntity.ok(weeklyData);

        } catch (Exception e) {
            logger.error("Error fetching monthly transaction summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to load monthly transaction summary: " + e.getMessage()));
        }
    }

    @GetMapping("/transactions/categories-summary")
    public ResponseEntity<?> getTransactionsByCategory(
            @RequestParam(defaultValue = "month") String timeframe,
            Authentication authentication) {

        logger.info("Fetching transactions by category for timeframe: {}, user: {}",
                timeframe, authentication.getName());

        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();

            // Calculate date range based on timeframe
            LocalDate endDate = LocalDate.now();
            LocalDate startDate;

            switch (timeframe) {
                case "week":
                    startDate = endDate.minusWeeks(1);
                    break;
                case "year":
                    startDate = endDate.minusYears(1);
                    break;
                case "month":
                default:
                    startDate = endDate.minusMonths(1);
                    break;
            }

            // Get expense transactions for the timeframe
            List<Transaction> expenses = transactionRepository.findExpenseTransactionsByUser(userId)
                    .stream()
                    .filter(tx -> !tx.getDate().isBefore(startDate) && !tx.getDate().isAfter(endDate))
                    .collect(Collectors.toList());

            // Calculate total expenses
            BigDecimal totalExpenses = expenses.stream()
                    .map(Transaction::getAmount)
                    .map(BigDecimal::abs)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Group by category
            Map<String, BigDecimal> categoryAmounts = new HashMap<>();

            for (Transaction tx : expenses) {
                String category = tx.getCategory() != null && !tx.getCategory().isEmpty()
                        ? tx.getCategory() : "Uncategorized";
                BigDecimal amount = tx.getAmount().abs();

                categoryAmounts.put(category,
                        categoryAmounts.getOrDefault(category, BigDecimal.ZERO).add(amount));
            }

            // Create result list
            List<Map<String, Object>> categories = new ArrayList<>();

            for (Map.Entry<String, BigDecimal> entry : categoryAmounts.entrySet()) {
                BigDecimal percentage = BigDecimal.ZERO;

                if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                    percentage = entry.getValue()
                            .divide(totalExpenses, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                }

                Map<String, Object> category = new HashMap<>();
                category.put("category", entry.getKey());
                category.put("amount", entry.getValue());
                category.put("percentage", percentage.setScale(0, RoundingMode.HALF_UP).intValue());

                categories.add(category);
            }

            // Sort by amount (descending)
            categories.sort((a, b) -> {
                BigDecimal amountA = (BigDecimal) a.get("amount");
                BigDecimal amountB = (BigDecimal) b.get("amount");
                return amountB.compareTo(amountA);
            });

            logger.info("Successfully fetched category breakdown with {} categories", categories.size());
            return ResponseEntity.ok(categories);

        } catch (Exception e) {
            logger.error("Error fetching category breakdown: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to load category breakdown: " + e.getMessage()));
        }
    }

    @GetMapping("/transactions/recent-summary")
    public ResponseEntity<?> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {

        logger.info("Fetching {} recent transactions for user: {}", limit, authentication.getName());

        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();

            // Get recent transactions, sorted by date (descending)
            List<Transaction> recentTxs = transactionRepository.findByCreatedByOrderByDateDesc(
                    userId, PageRequest.of(0, limit));

            // Transform to response format
            List<Map<String, Object>> transactions = new ArrayList<>();

            for (Transaction tx : recentTxs) {
                Map<String, Object> transaction = new HashMap<>();
                transaction.put("id", tx.getId());
                transaction.put("date", tx.getDate().toString());
                transaction.put("description", tx.getDescription());
                transaction.put("category", tx.getCategory());
                transaction.put("amount", tx.getAmount());

                transactions.add(transaction);
            }

            logger.info("Successfully fetched {} recent transactions", transactions.size());
            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            logger.error("Error fetching recent transactions: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Failed to load recent transactions: " + e.getMessage()));
        }
    }
}