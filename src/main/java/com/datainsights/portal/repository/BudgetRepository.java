package com.datainsights.portal.repository;

import com.datainsights.portal.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByCreatedBy(Long userId);

    List<Budget> findByCategory(String category);

    List<Budget> findByCreatedByAndCategory(Long userId, String category);

    @Query("SELECT b FROM Budget b WHERE b.createdBy = :userId AND " +
            "(b.startDate <= :date AND (b.endDate IS NULL OR b.endDate >= :date))")
    List<Budget> findActiveBudgetsByUserAndDate(@Param("userId") Long userId,
                                                @Param("date") LocalDate date);
}