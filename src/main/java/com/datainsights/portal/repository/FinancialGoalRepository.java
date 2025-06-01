package com.datainsights.portal.repository;

import com.datainsights.portal.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {
    // Fix: Use Long userId instead of User object to match database schema
    List<FinancialGoal> findByCreatedByOrderByPriorityDesc(Long userId);
    Optional<FinancialGoal> findByIdAndCreatedBy(Long id, Long userId);
    List<FinancialGoal> findByCreatedByAndCategory(Long userId, String category);

    // Simple method for basic queries
    List<FinancialGoal> findByCreatedBy(Long userId);
}