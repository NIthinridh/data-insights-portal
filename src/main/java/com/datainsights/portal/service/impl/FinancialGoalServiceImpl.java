package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.FinancialGoal;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.FinancialGoalRepository;
import com.datainsights.portal.service.FinancialGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class FinancialGoalServiceImpl implements FinancialGoalService {

    private final FinancialGoalRepository goalRepository;

    @Override
    public List<FinancialGoal> getAllGoalsByUser(User user) {
        return goalRepository.findByCreatedByOrderByPriorityDesc(user);
    }

    @Override
    public FinancialGoal getGoalById(Long id, User user) {
        return goalRepository.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new RuntimeException("Goal not found or access denied"));
    }

    @Override
    public FinancialGoal createGoal(FinancialGoal goal, User user) {
        goal.setCreatedBy(user);
        if (goal.getCurrentAmount() == null) {
            goal.setCurrentAmount(0.0);
        }
        return goalRepository.save(goal);
    }

    @Override
    public FinancialGoal updateGoal(Long id, FinancialGoal goalData, User user) {
        FinancialGoal existingGoal = getGoalById(id, user);

        existingGoal.setName(goalData.getName());
        existingGoal.setTargetAmount(goalData.getTargetAmount());
        existingGoal.setCurrentAmount(goalData.getCurrentAmount());
        existingGoal.setCategory(goalData.getCategory());
        existingGoal.setStartDate(goalData.getStartDate());
        existingGoal.setTargetDate(goalData.getTargetDate());
        existingGoal.setPriority(goalData.getPriority());
        existingGoal.setNotes(goalData.getNotes());

        return goalRepository.save(existingGoal);
    }

    @Override
    public void deleteGoal(Long id, User user) {
        FinancialGoal goal = getGoalById(id, user);
        goalRepository.delete(goal);
    }

    @Override
    public FinancialGoal addContribution(Long id, Double amount, User user) {
        FinancialGoal goal = getGoalById(id, user);
        goal.setCurrentAmount(goal.getCurrentAmount() + amount);
        return goalRepository.save(goal);
    }

    @Override
    public Map<String, Object> getGoalProgress(Long id, User user) {
        FinancialGoal goal = getGoalById(id, user);

        double targetAmount = goal.getTargetAmount();
        double currentAmount = goal.getCurrentAmount();
        double progressPercentage = (currentAmount / targetAmount) * 100;
        double remainingAmount = targetAmount - currentAmount;

        LocalDate today = LocalDate.now();
        long daysRemaining = ChronoUnit.DAYS.between(today, goal.getTargetDate());

        Map<String, Object> progressInfo = new HashMap<>();
        progressInfo.put("goalId", goal.getId());
        progressInfo.put("progressPercentage", progressPercentage);
        progressInfo.put("remainingAmount", remainingAmount);
        progressInfo.put("daysRemaining", daysRemaining);

        return progressInfo;
    }
}