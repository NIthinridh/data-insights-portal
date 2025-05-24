package com.datainsights.portal.service;

import com.datainsights.portal.model.Budget;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BudgetService {
    List<Budget> getAllBudgets();
    Optional<Budget> getBudgetById(Long id);
    Budget createBudget(Budget budget);
    Budget updateBudget(Long id, Budget budget);
    void deleteBudget(Long id);
    Map<String, Double> getBudgetProgress(int year, int month);
}