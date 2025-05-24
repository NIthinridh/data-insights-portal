package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.Budget;
import com.datainsights.portal.model.User;
import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.repository.BudgetRepository;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.repository.TransactionRepository;
import com.datainsights.portal.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class BudgetServiceImpl implements BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public List<Budget> getAllBudgets() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return budgetRepository.findByCreatedBy(user.getId());
    }

    @Override
    public Optional<Budget> getBudgetById(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Budget> budget = budgetRepository.findById(id);
        if (budget.isPresent() && budget.get().getCreatedBy().equals(user.getId())) {
            return budget;
        }
        return Optional.empty();
    }

    @Override
    public Budget createBudget(Budget budget) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        budget.setCreatedBy(user.getId());
        return budgetRepository.save(budget);
    }

    @Override
    public Budget updateBudget(Long id, Budget budgetDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this budget");
        }

        budget.setCategory(budgetDetails.getCategory());
        budget.setAmount(budgetDetails.getAmount());
        budget.setPeriod(budgetDetails.getPeriod());
        budget.setStartDate(budgetDetails.getStartDate());
        budget.setEndDate(budgetDetails.getEndDate());
        budget.setNotes(budgetDetails.getNotes());

        return budgetRepository.save(budget);
    }

    @Override
    public void deleteBudget(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getCreatedBy().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this budget");
        }

        budgetRepository.delete(budget);
    }

    @Override
    public Map<String, Double> getBudgetProgress(int year, int month) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all budgets for the user
        List<Budget> budgets = budgetRepository.findByCreatedBy(user.getId());

        // Get date range for the specified month
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        // Get all transactions for the specified date range
        List<Transaction> monthlyTransactions = transactionRepository.findByDateBetween(startOfMonth, endOfMonth);

        // Calculate spending by category
        Map<String, Double> progress = new HashMap<>();
        for (Budget budget : budgets) {
            // Only include budgets that are active for this month
            if (!budget.getStartDate().isAfter(endOfMonth) &&
                    (budget.getEndDate() == null || !budget.getEndDate().isBefore(startOfMonth))) {

                // Calculate spending for this category (only expense transactions)
                double spent = monthlyTransactions.stream()
                        .filter(t -> t.getCreatedBy() != null && t.getCreatedBy().equals(user.getId())) // Filter by user
                        .filter(t -> t.getCategory() != null && t.getCategory().equals(budget.getCategory()))
                        .filter(t -> "expense".equals(t.getType()) || t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                        .mapToDouble(t -> t.getAmount().abs().doubleValue())
                        .sum();

                progress.put(budget.getCategory(), spent);
            }
        }

        return progress;
    }
}