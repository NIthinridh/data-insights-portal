package com.datainsights.portal.repository;

import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find transactions by date range
    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Find transactions by category
    List<Transaction> findByCategory(String category);

    // Find income transactions (amount > 0)
    List<Transaction> findByAmountGreaterThan(BigDecimal amount);

    // Find expense transactions (amount < 0)
    List<Transaction> findByAmountLessThan(BigDecimal amount);

    // Find transactions by account
    List<Transaction> findByAccount(String account);

    // Find all with combined filters
    @Query("SELECT t FROM Transaction t WHERE " +
            "(:startDate IS NULL OR t.date >= :startDate) AND " +
            "(:endDate IS NULL OR t.date <= :endDate) AND " +
            "(:category IS NULL OR t.category = :category) AND " +
            "((:type = 'income' AND t.amount > 0) OR " +
            "(:type = 'expense' AND t.amount < 0) OR " +
            ":type IS NULL)")
    List<Transaction> findWithFilters(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("category") String category,
            @Param("type") String type);

    // Find the distinct categories for transactions
    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.amount > 0")
    List<String> findDistinctIncomeCategories();

    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.amount < 0")
    List<String> findDistinctExpenseCategories();

    // Find transactions by createdBy (user ID)
    List<Transaction> findByCreatedBy(Long userId);

    // Find transactions by user ID and type
    @Query("SELECT t FROM Transaction t WHERE t.createdBy = :userId AND " +
            "CASE WHEN :type = 'INCOME' THEN t.amount > 0 " +
            "WHEN :type = 'EXPENSE' THEN t.amount < 0 " +
            "ELSE 1=1 END")
    List<Transaction> findByCreatedByAndType(@Param("userId") Long userId, @Param("type") String type);

    // Find transactions by user ID and date range
    List<Transaction> findByCreatedByAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // Find income transactions by user ID
    @Query("SELECT t FROM Transaction t WHERE t.createdBy = :userId AND t.amount > 0")
    List<Transaction> findIncomeTransactionsByUser(@Param("userId") Long userId);

    // Find expense transactions by user ID
    @Query("SELECT t FROM Transaction t WHERE t.createdBy = :userId AND t.amount < 0")
    List<Transaction> findExpenseTransactionsByUser(@Param("userId") Long userId);

    // Find transactions by user ID and category
    List<Transaction> findByCreatedByAndCategory(Long userId, String category);

    // Find distinct income categories by user ID
    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.createdBy = :userId AND t.amount > 0")
    List<String> findDistinctIncomeCategoriesByUser(@Param("userId") Long userId);

    // Find distinct expense categories by user ID
    @Query("SELECT DISTINCT t.category FROM Transaction t WHERE t.createdBy = :userId AND t.amount < 0")
    List<String> findDistinctExpenseCategoriesByUser(@Param("userId") Long userId);

    // Sum income by user ID and date range
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.createdBy = :userId AND t.amount > 0 AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumIncomeByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Sum expenses by user ID and date range
    @Query("SELECT COALESCE(SUM(ABS(t.amount)), 0) FROM Transaction t WHERE t.createdBy = :userId AND t.amount < 0 AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumExpensesByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // NEW METHODS FOR DASHBOARD:

    // Count transactions in a date range for a user
    int countByCreatedByAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    // Find transactions by user with date range and order by date (descending)
    List<Transaction> findByCreatedByAndDateBetweenOrderByDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);

    // Find most recent transactions for a user with pagination
    List<Transaction> findByCreatedByOrderByDateDesc(Long userId, Pageable pageable);
}