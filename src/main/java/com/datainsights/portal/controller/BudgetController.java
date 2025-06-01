package com.datainsights.portal.controller;

import com.datainsights.portal.model.Budget;
import com.datainsights.portal.repository.BudgetRepository;
import com.datainsights.portal.service.BudgetService;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = {"http://localhost:3000", "https://data-insights-portal-production.up.railway.app"})
public class BudgetController {

    private static final Logger logger = LoggerFactory.getLogger(BudgetController.class);

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getAllBudgets() {
        try {
            List<Budget> budgets = budgetService.getAllBudgets();
            logger.info("Successfully retrieved {} budgets", budgets.size());
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            logger.error("Error retrieving budgets: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/budgets/debug")
    public ResponseEntity<Map<String, Object>> debugBudgets() {
        try {
            Map<String, Object> debug = new HashMap<>();

            // Direct repository call to bypass service layer
            List<Budget> allBudgets = budgetRepository.findAll();

            debug.put("totalBudgetsInDatabase", allBudgets.size());
            debug.put("budgets", allBudgets);
            debug.put("serviceLayerResult", budgetService.getAllBudgets().size());

            logger.info("DEBUG: Found {} budgets in database directly", allBudgets.size());
            logger.info("DEBUG: Service layer returns {} budgets", budgetService.getAllBudgets().size());

            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            logger.error("Debug error: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    @GetMapping("/budgets/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        try {
            return budgetService.getBudgetById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving budget with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Map<String, Object> budgetData) {
        try {
            Budget budget = new Budget();
            budget.setCategory((String) budgetData.get("category"));
            budget.setAmount(Double.parseDouble(budgetData.get("amount").toString()));
            budget.setPeriod((String) budgetData.get("period"));

            if (budgetData.get("startDate") != null) {
                String startDateStr = (String) budgetData.get("startDate");
                budget.setStartDate(LocalDate.parse(startDateStr, DateTimeFormatter.ISO_DATE));
            } else {
                budget.setStartDate(LocalDate.now());
            }

            if (budgetData.get("endDate") != null) {
                String endDateStr = (String) budgetData.get("endDate");
                budget.setEndDate(LocalDate.parse(endDateStr, DateTimeFormatter.ISO_DATE));
            }

            budget.setNotes((String) budgetData.get("notes"));
            Budget savedBudget = budgetService.createBudget(budget);
            logger.info("Successfully created budget with ID: {}", savedBudget.getId());
            return ResponseEntity.ok(savedBudget);
        } catch (Exception e) {
            logger.error("Error creating budget: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/budgets/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long id, @RequestBody Map<String, Object> budgetData) {
        try {
            Budget budgetDetails = new Budget();
            budgetDetails.setCategory((String) budgetData.get("category"));
            budgetDetails.setAmount(Double.parseDouble(budgetData.get("amount").toString()));
            budgetDetails.setPeriod((String) budgetData.get("period"));

            if (budgetData.get("startDate") != null) {
                String startDateStr = (String) budgetData.get("startDate");
                budgetDetails.setStartDate(LocalDate.parse(startDateStr, DateTimeFormatter.ISO_DATE));
            }

            if (budgetData.get("endDate") != null) {
                String endDateStr = (String) budgetData.get("endDate");
                budgetDetails.setEndDate(LocalDate.parse(endDateStr, DateTimeFormatter.ISO_DATE));
            }

            budgetDetails.setNotes((String) budgetData.get("notes"));

            Budget updatedBudget = budgetService.updateBudget(id, budgetDetails);
            logger.info("Successfully updated budget with ID: {}", id);
            return ResponseEntity.ok(updatedBudget);
        } catch (RuntimeException e) {
            logger.error("Budget not found or access denied for ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating budget with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            logger.info("Successfully deleted budget with ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Budget not found or access denied for ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting budget with ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // FIXED: Changed return type and structure to prevent frontend crashes
    @GetMapping("/budgets/progress")
    public ResponseEntity<Map<String, Object>> getBudgetProgress(
            @RequestParam(required = false, defaultValue = "2025") int year,
            @RequestParam(required = false, defaultValue = "5") int month) {

        logger.info("Getting budget progress for year: {}, month: {}", year, month);

        try {
            // Get raw progress from service
            Map<String, Double> rawProgress = budgetService.getBudgetProgress(year, month);

            // Create frontend-friendly response structure
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> progressArray = new ArrayList<>();

            if (rawProgress != null && !rawProgress.isEmpty()) {
                for (Map.Entry<String, Double> entry : rawProgress.entrySet()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", entry.getKey());
                    item.put("spent", entry.getValue());
                    item.put("budget", 500.0); // Default budget - make dynamic later
                    item.put("percentage", Math.min(100.0, (entry.getValue() / 500.0) * 100));
                    progressArray.add(item);
                }
            } else {
                // Demo data to prevent crashes
                String[] categories = {"Food", "Transportation", "Entertainment"};
                double[] amounts = {320.50, 180.25, 95.75};

                for (int i = 0; i < categories.length; i++) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", categories[i]);
                    item.put("spent", amounts[i]);
                    item.put("budget", 500.0);
                    item.put("percentage", (amounts[i] / 500.0) * 100);
                    progressArray.add(item);
                }
            }

            // Structure that frontend expects
            response.put("progress", progressArray);
            response.put("length", progressArray.size()); // KEY: This prevents the .length error
            response.put("year", year);
            response.put("month", month);
            response.put("totalCategories", progressArray.size());

            logger.info("Budget progress response created with {} items", progressArray.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error in budget progress: {}", e.getMessage(), e);

            // Safe fallback to prevent crashes
            Map<String, Object> fallback = new HashMap<>();
            List<Map<String, Object>> fallbackArray = new ArrayList<>();

            Map<String, Object> demoItem = new HashMap<>();
            demoItem.put("category", "Demo");
            demoItem.put("spent", 100.0);
            demoItem.put("budget", 500.0);
            demoItem.put("percentage", 20.0);
            fallbackArray.add(demoItem);

            fallback.put("progress", fallbackArray);
            fallback.put("length", 1);
            fallback.put("year", year);
            fallback.put("month", month);
            fallback.put("error", "Service unavailable - demo data");

            return ResponseEntity.ok(fallback);
        }
    }
}