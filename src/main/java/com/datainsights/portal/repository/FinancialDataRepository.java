package com.datainsights.portal.repository;

import com.datainsights.portal.model.FinancialData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialDataRepository extends JpaRepository<FinancialData, Long> {

    List<FinancialData> findByImportId(Long importId);

    // Method to find financial data by date range and user ID
    List<FinancialData> findByTransactionDateBetweenAndCreatedBy(
            LocalDate startDate, LocalDate endDate, Long createdBy);

    // Add this method for filtering by category
    List<FinancialData> findByTransactionDateBetweenAndCategoryAndCreatedBy(
            LocalDate startDate, LocalDate endDate, String category, Long createdBy);
}