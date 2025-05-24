package com.datainsights.portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/financial")
public class FinancialController {

    // Dashboard endpoint
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData(@RequestParam(defaultValue = "month") String timeframe) {
        // In a real application, you would fetch this data from a service
        // For now, let's return mock data
        Map<String, Object> response = new HashMap<>();

        // Summary data
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", 4500.00);
        summary.put("totalExpenses", 3200.00);
        summary.put("netSavings", 1300.00);
        summary.put("budgetProgress", 75);

        // Chart data
        List<Map<String, Object>> incomeByCategory = new ArrayList<>();
        incomeByCategory.add(Map.of("category", "Salary", "amount", 4000.00));
        incomeByCategory.add(Map.of("category", "Investments", "amount", 350.00));
        incomeByCategory.add(Map.of("category", "Other", "amount", 150.00));

        List<Map<String, Object>> expensesByCategory = new ArrayList<>();
        expensesByCategory.add(Map.of("category", "Housing", "amount", 1200.00));
        expensesByCategory.add(Map.of("category", "Food", "amount", 600.00));
        expensesByCategory.add(Map.of("category", "Transportation", "amount", 400.00));
        expensesByCategory.add(Map.of("category", "Entertainment", "amount", 300.00));
        expensesByCategory.add(Map.of("category", "Utilities", "amount", 450.00));
        expensesByCategory.add(Map.of("category", "Other", "amount", 250.00));

        // Recent transactions
        List<Map<String, Object>> recentTransactions = new ArrayList<>();
        recentTransactions.add(Map.of(
                "id", 1,
                "date", LocalDate.now().minusDays(1).toString(),
                "description", "Grocery Shopping",
                "amount", -120.50,
                "category", "Food"
        ));
        recentTransactions.add(Map.of(
                "id", 2,
                "date", LocalDate.now().minusDays(2).toString(),
                "description", "Salary Deposit",
                "amount", 2000.00,
                "category", "Salary"
        ));
        recentTransactions.add(Map.of(
                "id", 3,
                "date", LocalDate.now().minusDays(3).toString(),
                "description", "Utility Bill",
                "amount", -85.00,
                "category", "Utilities"
        ));

        // Add all data to response
        response.put("summary", summary);
        response.put("incomeByCategory", incomeByCategory);
        response.put("expensesByCategory", expensesByCategory);
        response.put("recentTransactions", recentTransactions);
        response.put("timeframe", timeframe);

        return ResponseEntity.ok(response);
    }

    // Transactions endpoint
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {

        // Mock data
        List<Map<String, Object>> transactions = new ArrayList<>();
        transactions.add(Map.of(
                "id", 1,
                "date", "2023-06-01",
                "description", "Grocery Shopping",
                "amount", -120.50,
                "category", "Food",
                "type", "expense"
        ));
        transactions.add(Map.of(
                "id", 2,
                "date", "2023-06-02",
                "description", "Salary Deposit",
                "amount", 2000.00,
                "category", "Salary",
                "type", "income"
        ));
        transactions.add(Map.of(
                "id", 3,
                "date", "2023-06-05",
                "description", "Utility Bill",
                "amount", -85.00,
                "category", "Utilities",
                "type", "expense"
        ));

        return ResponseEntity.ok(transactions);
    }

    // Categories endpoint
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        List<String> incomeCategories = Arrays.asList("Salary", "Investments", "Gifts", "Other");
        List<String> expenseCategories = Arrays.asList(
                "Housing", "Food", "Transportation", "Entertainment",
                "Utilities", "Healthcare", "Education", "Shopping", "Other"
        );

        Map<String, List<String>> categories = new HashMap<>();
        categories.put("income", incomeCategories);
        categories.put("expense", expenseCategories);

        return ResponseEntity.ok(categories);
    }

    // Simple test endpoint
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Financial API test successful");
    }

    @GetMapping("/transactions/monthly")
    public ResponseEntity<?> getTransactionsByMonth(
            @RequestParam int year,
            @RequestParam int month) {

        // Mock data for monthly transactions
        List<Map<String, Object>> transactions = new ArrayList<>();

        // Add some sample transactions for the requested month
        transactions.add(Map.of(
                "id", 1,
                "date", String.format("%d-%02d-01", year, month),
                "description", "Rent Payment",
                "amount", -1200.00,
                "category", "Housing",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 2,
                "date", String.format("%d-%02d-05", year, month),
                "description", "Salary Deposit",
                "amount", 3500.00,
                "category", "Salary",
                "type", "income"
        ));

        transactions.add(Map.of(
                "id", 3,
                "date", String.format("%d-%02d-10", year, month),
                "description", "Grocery Shopping",
                "amount", -150.75,
                "category", "Food",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 4,
                "date", String.format("%d-%02d-15", year, month),
                "description", "Utility Bill",
                "amount", -95.50,
                "category", "Utilities",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 5,
                "date", String.format("%d-%02d-20", year, month),
                "description", "Investment Dividend",
                "amount", 75.25,
                "category", "Investments",
                "type", "income"
        ));

        // Include summary data
        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        response.put("totalIncome", 3575.25);
        response.put("totalExpenses", 1446.25);
        response.put("netBalance", 2129.00);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/by-category")
    public ResponseEntity<?> getTransactionsByCategory(
            @RequestParam(defaultValue = "month") String timeframe) {

        // Mock data for transactions by category
        Map<String, Object> response = new HashMap<>();

        // Income categories
        Map<String, Double> incomeByCategory = new HashMap<>();
        incomeByCategory.put("Salary", 3500.00);
        incomeByCategory.put("Investments", 250.75);
        incomeByCategory.put("Other", 125.50);

        // Expense categories
        Map<String, Double> expensesByCategory = new HashMap<>();
        expensesByCategory.put("Housing", 1200.00);
        expensesByCategory.put("Food", 450.25);
        expensesByCategory.put("Transportation", 200.50);
        expensesByCategory.put("Entertainment", 150.75);
        expensesByCategory.put("Utilities", 175.25);
        expensesByCategory.put("Healthcare", 85.00);
        expensesByCategory.put("Education", 50.00);
        expensesByCategory.put("Other", 100.25);

        response.put("timeframe", timeframe);
        response.put("incomeByCategory", incomeByCategory);
        response.put("expensesByCategory", expensesByCategory);
        response.put("totalIncome", 3876.25);
        response.put("totalExpenses", 2412.00);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/recent")
    public ResponseEntity<?> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit) {

        // Mock data for recent transactions
        List<Map<String, Object>> transactions = new ArrayList<>();

        transactions.add(Map.of(
                "id", 1,
                "date", "2025-04-20",
                "description", "Grocery Shopping",
                "amount", -85.75,
                "category", "Food",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 2,
                "date", "2025-04-19",
                "description", "Gas Station",
                "amount", -45.50,
                "category", "Transportation",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 3,
                "date", "2025-04-18",
                "description", "Restaurant Dinner",
                "amount", -65.20,
                "category", "Food",
                "type", "expense"
        ));

        transactions.add(Map.of(
                "id", 4,
                "date", "2025-04-15",
                "description", "Salary Deposit",
                "amount", 2000.00,
                "category", "Salary",
                "type", "income"
        ));

        transactions.add(Map.of(
                "id", 5,
                "date", "2025-04-10",
                "description", "Phone Bill",
                "amount", -55.99,
                "category", "Utilities",
                "type", "expense"
        ));

        // Limit the number of transactions based on the parameter
        transactions = transactions.stream().limit(limit).collect(Collectors.toList());

        return ResponseEntity.ok(transactions);
    }
}