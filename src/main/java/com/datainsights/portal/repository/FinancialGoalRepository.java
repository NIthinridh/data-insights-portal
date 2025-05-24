package com.datainsights.portal.repository;

import com.datainsights.portal.model.FinancialGoal;
import com.datainsights.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {
    List<FinancialGoal> findByCreatedByOrderByPriorityDesc(User user);
    Optional<FinancialGoal> findByIdAndCreatedBy(Long id, User user);
    List<FinancialGoal> findByCreatedByAndCategory(User user, String category);
}