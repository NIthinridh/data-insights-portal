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
@CrossOrigin(origins = {"http://localhost:3000", "https://data-insights-portal-production.up.railway.app"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
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
                timeframe, authentication != null ? authentication.getName() : "anonymous");

        try {
            // Handle unauthenticated requests by returning demo data
            if (authentication == null || authentication.getName() == null) {
                logger.info("No authentication found, returning demo data");
                return ResponseEntity.ok(getDemoData());
            }

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

            // Handle null values from database
            if (totalIncome == null) totalIncome = BigDecimal.ZERO;
            if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

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
            // Return demo data if there's an error
            logger.info("Error occurred, returning demo data as fallback");
            return ResponseEntity.ok(getDemoData());
        }
    }

    // Demo data for when user has no transactions or is not authenticated
    private Map<String, Object> getDemoData() {
        Map<String, Object> demoData = new HashMap<>();
        demoData.put("totalTransactions", 12);
        demoData.put("totalAmount", new BigDecimal("2450.75"));
        demoData.put("avgTransaction", new BigDecimal("204.23"));
        demoData.put("recentImports", 2);
        demoData.put("income", new BigDecimal("5000.00"));
        demoData.put("expenses", new BigDecimal("2549.25"));
        demoData.put("balance", new BigDecimal("2450.75"));
        demoData.put("savingsRate", new BigDecimal("49.0"));
        return demoData;
    }

    @GetMapping("/transactions/monthly-summary")
    public ResponseEntity<?> getTransactionsByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication authentication) {

        logger.info("Fetching monthly transactions for year: {}, month: {}, user: {}",
                year, month, authentication != null ? authentication.getName() : "anonymous");

        try {
            // Return demo data if not authenticated
            if (authentication == null || authentication.getName() == null) {
                logger.info("No authentication found, returning demo monthly data");
                return ResponseEntity.ok(getDemoMonthlyData());
            }

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

            // If no data, return demo data
            if (weeklyData.isEmpty()) {
                logger.info("No transaction data found, returning demo monthly data");
                return ResponseEntity.ok(getDemoMonthlyData());
            }

            logger.info("Successfully fetched monthly transaction summary with {} weeks of data", weeklyData.size());
            return ResponseEntity.ok(weeklyData);

        } catch (Exception e) {
            logger.error("Error fetching monthly transaction summary: {}", e.getMessage(), e);
            return ResponseEntity.ok(getDemoMonthlyData());
        }
    }

    private List<Map<String, Object>> getDemoMonthlyData() {
        List<Map<String, Object>> demoData = new ArrayList<>();

        for (int week = 1; week <= 4; week++) {
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("period", "Week " + week);
            weekData.put("amount", new BigDecimal((week * 300) + ".00"));
            weekData.put("income", new BigDecimal((week * 400) + ".00"));
            weekData.put("expenses", new BigDecimal((week * 100) + ".00"));
            demoData.add(weekData);
        }

        return demoData;
    }

    @GetMapping("/transactions/categories-summary")
    public ResponseEntity<?> getTransactionsByCategory(
            @RequestParam(defaultValue = "month") String timeframe,
            Authentication authentication) {

        logger.info("Fetching transactions by category for timeframe: {}, user: {}",
                timeframe, authentication != null ? authentication.getName() : "anonymous");

        try {
            // Return demo data if not authenticated
            if (authentication == null || authentication.getName() == null) {
                logger.info("No authentication found, returning demo category data");
                return ResponseEntity.ok(getDemoCategoryData());
            }

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

            // If no expenses, return demo data
            if (expenses.isEmpty()) {
                logger.info("No expense data found, returning demo category data");
                return ResponseEntity.ok(getDemoCategoryData());
            }

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
            return ResponseEntity.ok(getDemoCategoryData());
        }
    }

    private List<Map<String, Object>> getDemoCategoryData() {
        List<Map<String, Object>> demoData = new ArrayList<>();

        String[] categories = {"Food", "Transportation", "Entertainment", "Utilities", "Shopping"};
        int[] percentages = {35, 25, 15, 15, 10};
        BigDecimal[] amounts = {
                new BigDecimal("892.50"), new BigDecimal("637.32"), new BigDecimal("382.40"),
                new BigDecimal("382.40"), new BigDecimal("254.63")
        };

        for (int i = 0; i < categories.length; i++) {
            Map<String, Object> category = new HashMap<>();
            category.put("category", categories[i]);
            category.put("amount", amounts[i]);
            category.put("percentage", percentages[i]);
            demoData.add(category);
        }

        return demoData;
    }

    @GetMapping("/transactions/recent-summary")
    public ResponseEntity<?> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {

        logger.info("Fetching {} recent transactions for user: {}", limit,
                authentication != null ? authentication.getName() : "anonymous");

        try {
            // Return demo data if not authenticated
            if (authentication == null || authentication.getName() == null) {
                logger.info("No authentication found, returning demo recent transactions");
                return ResponseEntity.ok(getDemoRecentTransactions());
            }

            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long userId = user.getId();

            // Get recent transactions, sorted by date (descending)
            List<Transaction> recentTxs = transactionRepository.findByCreatedByOrderByDateDesc(
                    userId, PageRequest.of(0, limit));

            // If no transactions, return demo data
            if (recentTxs.isEmpty()) {
                logger.info("No transactions found, returning demo recent transactions");
                return ResponseEntity.ok(getDemoRecentTransactions());
            }

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
            return ResponseEntity.ok(getDemoRecentTransactions());
        }
    }

    private List<Map<String, Object>> getDemoRecentTransactions() {
        List<Map<String, Object>> demoData = new ArrayList<>();

        String[][] transactions = {
                {"1", "2025-05-23", "Grocery Store", "Food", "-89.50"},
                {"2", "2025-05-22", "Salary Deposit", "Income", "2500.00"},
                {"3", "2025-05-21", "Gas Station", "Transportation", "-45.20"},
                {"4", "2025-05-20", "Netflix Subscription", "Entertainment", "-15.99"},
                {"5", "2025-05-19", "Coffee Shop", "Food", "-5.75"}
        };

        for (String[] tx : transactions) {
            Map<String, Object> transaction = new HashMap<>();
            transaction.put("id", Long.parseLong(tx[0]));
            transaction.put("date", tx[1]);
            transaction.put("description", tx[2]);
            transaction.put("category", tx[3]);
            transaction.put("amount", new BigDecimal(tx[4]));
            demoData.add(transaction);
        }

        return demoData;
    }
}