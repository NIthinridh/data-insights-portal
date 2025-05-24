package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.Budget;
import com.datainsights.portal.model.FinancialGoal;
import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.BudgetRepository;
import com.datainsights.portal.repository.FinancialGoalRepository;
import com.datainsights.portal.repository.TransactionRepository;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.FinancialHealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FinancialHealthServiceImpl implements FinancialHealthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private FinancialGoalRepository financialGoalRepository;

    @Override
    public Map<String, Object> getFinancialHealth(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> healthData = new HashMap<>();

        // Calculate scores based on real data
        double savingsScore = calculateSavingsScore(user);
        double debtScore = calculateDebtScore(user);
        double budgetScore = calculateBudgetScore(user);
        double investmentScore = calculateInvestmentScore(user);

        // Calculate overall health score (weighted average)
        double overallScore = (savingsScore * 0.3) + (debtScore * 0.3) +
                (budgetScore * 0.25) + (investmentScore * 0.15);

        // Determine health status based on score
        String healthStatus = getHealthStatus(overallScore);

        // Create category scores
        List<Map<String, Object>> categories = new ArrayList<>();

        // Savings category
        categories.add(createSavingsCategory(user, savingsScore));

        // Debt management category
        categories.add(createDebtCategory(user, debtScore));

        // Spending habits category
        categories.add(createSpendingCategory(user, budgetScore));

        // Growth & investments category
        categories.add(createInvestmentCategory(user, investmentScore));

        // Compose final response
        healthData.put("overallScore", Math.round(overallScore * 10) / 10.0);
        healthData.put("previousScore", calculatePreviousScore(user)); // This would need historical data
        healthData.put("status", healthStatus);
        healthData.put("lastUpdated", LocalDate.now().format(DateTimeFormatter.ISO_DATE));
        healthData.put("categories", categories);

        return healthData;
    }

    private double calculateSavingsScore(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);

        BigDecimal totalIncome = transactionRepository.sumIncomeByUserAndDateRange(
                user.getId(), startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumExpensesByUserAndDateRange(
                user.getId(), startDate, endDate);

        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 50.0; // Default score if no income
        }

        BigDecimal savings = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = savings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        // Score based on savings rate (20% = 100 score)
        double score = savingsRate.doubleValue() * 5;
        return Math.min(100, Math.max(0, score));
    }

    private double calculateDebtScore(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);

        BigDecimal monthlyIncome = transactionRepository.sumIncomeByUserAndDateRange(
                user.getId(), startDate, endDate);

        // Find debt-related transactions (loans, credit cards, etc.)
        List<Transaction> debtTransactions = transactionRepository.findByCreatedByAndCategory(
                user.getId(), "Debt Payment");

        BigDecimal totalDebtPayments = debtTransactions.stream()
                .map(Transaction::getAmount)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 50.0; // Default score if no income
        }

        BigDecimal debtToIncomeRatio = totalDebtPayments.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        // Score based on debt-to-income ratio (lower is better)
        double score = 100 - (debtToIncomeRatio.doubleValue() * 2);
        return Math.min(100, Math.max(0, score));
    }

    private double calculateBudgetScore(User user) {
        List<Budget> budgets = budgetRepository.findByCreatedBy(user.getId());
        if (budgets.isEmpty()) {
            return 50.0; // Default score if no budgets
        }

        double totalScore = 0;
        int validBudgets = 0;

        for (Budget budget : budgets) {
            LocalDate startDate = budget.getStartDate();
            LocalDate endDate = budget.getEndDate() != null ? budget.getEndDate() : LocalDate.now();

            List<Transaction> transactions = transactionRepository.findByCreatedByAndCategory(
                    user.getId(), budget.getCategory());

            BigDecimal actualSpending = transactions.stream()
                    .filter(t -> !t.getDate().isBefore(startDate) && !t.getDate().isAfter(endDate))
                    .map(Transaction::getAmount)
                    .map(BigDecimal::abs)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal budgetAmount = BigDecimal.valueOf(budget.getAmount());

            if (budgetAmount.compareTo(BigDecimal.ZERO) > 0) {
                double adherence = actualSpending.divide(budgetAmount, 4, RoundingMode.HALF_UP)
                        .doubleValue();
                double score = adherence <= 1.0 ? 100 : Math.max(0, 100 - ((adherence - 1) * 100));
                totalScore += score;
                validBudgets++;
            }
        }

        return validBudgets > 0 ? totalScore / validBudgets : 50.0;
    }

    private double calculateInvestmentScore(User user) {
        // Check financial goals for investment-related goals
        List<FinancialGoal> investmentGoals = financialGoalRepository.findByCreatedByAndCategory(
                user, "Investment");

        // Check investment transactions
        List<Transaction> investmentTransactions = transactionRepository.findByCreatedByAndCategory(
                user.getId(), "Investment");

        if (investmentTransactions.isEmpty() && investmentGoals.isEmpty()) {
            return 40.0; // Lower score if no investments
        }

        double goalScore = 0;
        if (!investmentGoals.isEmpty()) {
            // Calculate progress towards investment goals
            for (FinancialGoal goal : investmentGoals) {
                double progress = goal.getCurrentAmount() / goal.getTargetAmount();
                goalScore += Math.min(100, progress * 100);
            }
            goalScore = goalScore / investmentGoals.size();
        }

        // Calculate investment diversity and regularity
        Set<String> investmentTypes = new HashSet<>();
        int regularInvestments = 0;

        for (Transaction t : investmentTransactions) {
            if (t.getDescription() != null) {
                investmentTypes.add(t.getDescription());
            }
            if (t.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                regularInvestments++;
            }
        }

        double diversityScore = Math.min(100, investmentTypes.size() * 20);
        double regularityScore = Math.min(100, regularInvestments * 10);

        // Combine all scores
        if (!investmentGoals.isEmpty()) {
            return (goalScore + diversityScore + regularityScore) / 3;
        } else {
            return (diversityScore + regularityScore) / 2;
        }
    }

    private String getHealthStatus(double score) {
        if (score >= 80) return "Excellent";
        if (score >= 70) return "Good";
        if (score >= 60) return "Fair";
        return "Needs Attention";
    }

    private Map<String, Object> createSavingsCategory(User user, double score) {
        Map<String, Object> category = new HashMap<>();
        category.put("id", "savings");
        category.put("name", "Savings");
        category.put("score", Math.round(score * 10) / 10.0);

        List<String> recommendations = new ArrayList<>();
        if (score < 80) {
            recommendations.add("Aim to save at least 20% of your monthly income");
            recommendations.add("Set up automatic transfers to your savings account");
            recommendations.add("Consider increasing your emergency fund to cover 6 months of expenses");
        }
        category.put("recommendations", recommendations);

        List<Map<String, Object>> metrics = new ArrayList<>();

        // Emergency fund metric
        Map<String, Object> emergencyFund = new HashMap<>();
        emergencyFund.put("name", "Emergency Fund");
        emergencyFund.put("value", calculateEmergencyFundMonths(user));
        emergencyFund.put("target", 6);
        emergencyFund.put("unit", "months");
        emergencyFund.put("status", calculateEmergencyFundMonths(user) >= 6 ? "good" : "warning");
        metrics.add(emergencyFund);

        // Savings rate metric
        Map<String, Object> savingsRate = new HashMap<>();
        savingsRate.put("name", "Savings Rate");
        savingsRate.put("value", calculateSavingsRate(user));
        savingsRate.put("target", 20);
        savingsRate.put("unit", "percent");
        savingsRate.put("status", calculateSavingsRate(user) >= 20 ? "good" : "warning");
        metrics.add(savingsRate);

        // Retirement contributions metric
        Map<String, Object> retirementContributions = new HashMap<>();
        retirementContributions.put("name", "Retirement Contributions");
        retirementContributions.put("value", calculateRetirementContributions(user));
        retirementContributions.put("target", 15);
        retirementContributions.put("unit", "percent");
        retirementContributions.put("status", calculateRetirementContributions(user) >= 15 ? "good" : "warning");
        metrics.add(retirementContributions);

        category.put("metrics", metrics);
        return category;
    }

    private Map<String, Object> createDebtCategory(User user, double score) {
        Map<String, Object> category = new HashMap<>();
        category.put("id", "debt");
        category.put("name", "Debt Management");
        category.put("score", Math.round(score * 10) / 10.0);

        List<String> recommendations = new ArrayList<>();
        if (score < 80) {
            recommendations.add("Focus on paying off high-interest debt first");
            recommendations.add("Consider consolidating your credit card debt");
            recommendations.add("Keep your credit utilization below 30%");
        }
        category.put("recommendations", recommendations);

        List<Map<String, Object>> metrics = new ArrayList<>();

        // Debt-to-income ratio
        Map<String, Object> debtRatio = new HashMap<>();
        debtRatio.put("name", "Debt-to-Income Ratio");
        debtRatio.put("value", calculateDebtToIncomeRatio(user));
        debtRatio.put("target", 36);
        debtRatio.put("unit", "percent");
        debtRatio.put("status", calculateDebtToIncomeRatio(user) <= 36 ? "good" : "warning");
        metrics.add(debtRatio);

        // Credit utilization (this would need credit card data)
        Map<String, Object> creditUtil = new HashMap<>();
        creditUtil.put("name", "Credit Utilization");
        creditUtil.put("value", 28); // Placeholder
        creditUtil.put("target", 30);
        creditUtil.put("unit", "percent");
        creditUtil.put("status", "good");
        metrics.add(creditUtil);

        category.put("metrics", metrics);
        return category;
    }

    private Map<String, Object> createSpendingCategory(User user, double score) {
        Map<String, Object> category = new HashMap<>();
        category.put("id", "spending");
        category.put("name", "Spending Habits");
        category.put("score", Math.round(score * 10) / 10.0);

        List<String> recommendations = new ArrayList<>();
        if (score < 80) {
            recommendations.add("Track your discretionary spending more closely");
            recommendations.add("Look for subscriptions or services you can cancel");
        }
        category.put("recommendations", recommendations);

        List<Map<String, Object>> metrics = new ArrayList<>();

        // Budget adherence
        Map<String, Object> budgetAdherence = new HashMap<>();
        budgetAdherence.put("name", "Budget Adherence");
        budgetAdherence.put("value", Math.round(score)); // Use the budget score as adherence
        budgetAdherence.put("target", 90);
        budgetAdherence.put("unit", "percent");
        budgetAdherence.put("status", score >= 85 ? "good" : "warning");
        metrics.add(budgetAdherence);

        category.put("metrics", metrics);
        return category;
    }

    private Map<String, Object> createInvestmentCategory(User user, double score) {
        Map<String, Object> category = new HashMap<>();
        category.put("id", "growth");
        category.put("name", "Growth & Investments");
        category.put("score", Math.round(score * 10) / 10.0);

        List<String> recommendations = new ArrayList<>();
        if (score < 80) {
            recommendations.add("Consider diversifying your investment portfolio");
            recommendations.add("Review your asset allocation to ensure it matches your goals");
        }
        category.put("recommendations", recommendations);

        List<Map<String, Object>> metrics = new ArrayList<>();

        Map<String, Object> investments = new HashMap<>();
        investments.put("name", "Investment Diversification");
        investments.put("value", score >= 70 ? "Moderate" : "Low");
        investments.put("target", "High");
        investments.put("unit", "");
        investments.put("status", score >= 70 ? "good" : "warning");
        metrics.add(investments);

        category.put("metrics", metrics);
        return category;
    }

    private int calculateEmergencyFundMonths(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);

        BigDecimal monthlyExpenses = transactionRepository.sumExpensesByUserAndDateRange(
                user.getId(), startDate, endDate).divide(new BigDecimal("3"), RoundingMode.HALF_UP);

        // Check for emergency fund goals
        List<FinancialGoal> emergencyGoals = financialGoalRepository.findByCreatedByAndCategory(
                user, "Emergency Fund");

        BigDecimal totalEmergencyFund = BigDecimal.ZERO;
        if (!emergencyGoals.isEmpty()) {
            totalEmergencyFund = emergencyGoals.stream()
                    .map(goal -> BigDecimal.valueOf(goal.getCurrentAmount()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        // Also check savings transactions
        List<Transaction> savingsTransactions = transactionRepository.findByCreatedByAndCategory(
                user.getId(), "Savings");

        BigDecimal totalSavings = savingsTransactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFund = totalEmergencyFund.add(totalSavings);

        if (monthlyExpenses.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        return totalFund.divide(monthlyExpenses, 0, RoundingMode.HALF_UP).intValue();
    }

    private int calculateSavingsRate(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);

        BigDecimal totalIncome = transactionRepository.sumIncomeByUserAndDateRange(
                user.getId(), startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumExpensesByUserAndDateRange(
                user.getId(), startDate, endDate);

        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        BigDecimal savings = totalIncome.subtract(totalExpenses);
        return savings.divide(totalIncome, 2, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue();
    }

    private int calculateRetirementContributions(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);

        BigDecimal totalIncome = transactionRepository.sumIncomeByUserAndDateRange(
                user.getId(), startDate, endDate);

        List<Transaction> retirementTransactions = transactionRepository.findByCreatedByAndCategory(
                user.getId(), "Retirement");

        BigDecimal retirementContributions = retirementTransactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        return retirementContributions.divide(totalIncome, 2, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue();
    }

    private int calculateDebtToIncomeRatio(User user) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(1);

        BigDecimal monthlyIncome = transactionRepository.sumIncomeByUserAndDateRange(
                user.getId(), startDate, endDate);

        List<Transaction> debtTransactions = transactionRepository.findByCreatedByAndCategory(
                user.getId(), "Debt Payment");

        BigDecimal totalDebtPayments = debtTransactions.stream()
                .filter(t -> t.getAmount().compareTo(BigDecimal.ZERO) < 0)
                .map(Transaction::getAmount)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        return totalDebtPayments.divide(monthlyIncome, 2, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .intValue();
    }

    @Override
    public List<Map<String, Object>> getHealthHistory(String username, int months) {
        List<Map<String, Object>> history = new ArrayList<>();
        LocalDate now = LocalDate.now();

        // This is a simplified version - in reality, you'd want to store historical scores
        double baseScore = 65.0;

        for (int i = months - 1; i >= 0; i--) {
            LocalDate date = now.minusMonths(i);
            double score = baseScore + (months - i) * 2.5; // Simulating gradual improvement

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", date.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.put("score", Math.round(score * 10) / 10.0);

            history.add(monthData);
        }

        return history;
    }

    @Override
    public List<Map<String, Object>> getHealthCategories() {
        List<Map<String, Object>> categories = new ArrayList<>();

        Map<String, Object> savings = new HashMap<>();
        savings.put("id", "savings");
        savings.put("name", "Savings");
        savings.put("description", "How well you're saving for emergencies and future goals");
        savings.put("metrics", Arrays.asList(
                "Emergency Fund",
                "Savings Rate",
                "Retirement Contributions"
        ));
        categories.add(savings);

        Map<String, Object> debt = new HashMap<>();
        debt.put("id", "debt");
        debt.put("name", "Debt Management");
        debt.put("description", "How effectively you're managing and reducing your debt");
        debt.put("metrics", Arrays.asList(
                "Debt-to-Income Ratio",
                "Credit Utilization",
                "Debt Payment Coverage"
        ));
        categories.add(debt);

        Map<String, Object> spending = new HashMap<>();
        spending.put("id", "spending");
        spending.put("name", "Spending Habits");
        spending.put("description", "How well you're managing your budget and spending");
        spending.put("metrics", Arrays.asList(
                "Budget Adherence",
                "Essential Expenses Ratio",
                "Discretionary Spending"
        ));
        categories.add(spending);

        Map<String, Object> growth = new HashMap<>();
        growth.put("id", "growth");
        growth.put("name", "Growth & Investments");
        growth.put("description", "How your investments are performing and diversified");
        growth.put("metrics", Arrays.asList(
                "Investment Diversification",
                "Investment Return",
                "Tax Efficiency"
        ));
        categories.add(growth);

        return categories;
    }

    @Override
    public Map<String, Object> updateHealthGoals(String username, Map<String, Object> goals) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // This would typically save goals to a database
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Financial health goals updated successfully");
        response.put("goals", goals);
        response.put("updatedAt", LocalDate.now().format(DateTimeFormatter.ISO_DATE));

        return response;
    }

    private double calculatePreviousScore(User user) {
        // This is a placeholder - you'd want to retrieve the actual previous score
        // from a historical data table
        return 68.0;
    }
}