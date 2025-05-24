package com.datainsights.portal.controller;

import com.datainsights.portal.model.Budget;
import com.datainsights.portal.service.BudgetService;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @GetMapping("/budgets")
    public ResponseEntity<List<Budget>> getAllBudgets() {
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @GetMapping("/budgets/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/budgets")
    public ResponseEntity<Budget> createBudget(@RequestBody Map<String, Object> budgetData) {
        try {
            Budget budget = new Budget();
            budget.setCategory((String) budgetData.get("category"));
            budget.setAmount(Double.parseDouble(budgetData.get("amount").toString()));
            budget.setPeriod((String) budgetData.get("period"));

            // Parse dates
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

            return ResponseEntity.ok(budgetService.createBudget(budget));
        } catch (Exception e) {
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

            // Parse dates
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
            return ResponseEntity.ok(updatedBudget);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/budgets/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/budgets/progress")
    public ResponseEntity<Map<String, Double>> getBudgetProgress(
            @RequestParam(required = false, defaultValue = "2025") int year,
            @RequestParam(required = false, defaultValue = "1") int month) {
        return ResponseEntity.ok(budgetService.getBudgetProgress(year, month));
    }
}