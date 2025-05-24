package com.datainsights.portal.service;

import com.datainsights.portal.model.FinancialGoal;
import com.datainsights.portal.model.User;
import java.util.List;
import java.util.Map;

public interface FinancialGoalService {
    List<FinancialGoal> getAllGoalsByUser(User user);
    FinancialGoal getGoalById(Long id, User user);
    FinancialGoal createGoal(FinancialGoal goal, User user);
    FinancialGoal updateGoal(Long id, FinancialGoal goal, User user);
    void deleteGoal(Long id, User user);
    FinancialGoal addContribution(Long id, Double amount, User user);
    Map<String, Object> getGoalProgress(Long id, User user);
}