package com.datainsights.portal.service;

import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;

        // Initialize with sample data if the repository is empty
        if (transactionRepository.count() == 0) {
            initializeSampleData();
        }
    }

    private void initializeSampleData() {
        List<Transaction> sampleTransactions = new ArrayList<>();

        Transaction tx1 = new Transaction();
        tx1.setDate(LocalDate.of(2025, 4, 20));
        tx1.setDescription("Grocery Shopping");
        tx1.setAmount(new BigDecimal("-85.75"));
        tx1.setCategory("Food");
        tx1.setAccount("Checking Account");
        tx1.setIsReconciled(false);
        sampleTransactions.add(tx1);

        Transaction tx2 = new Transaction();
        tx2.setDate(LocalDate.of(2025, 4, 19));
        tx2.setDescription("Gas Station");
        tx2.setAmount(new BigDecimal("-45.50"));
        tx2.setCategory("Transportation");
        tx2.setAccount("Credit Card");
        tx2.setIsReconciled(false);
        sampleTransactions.add(tx2);

        Transaction tx3 = new Transaction();
        tx3.setDate(LocalDate.of(2025, 4, 18));
        tx3.setDescription("Restaurant Dinner");
        tx3.setAmount(new BigDecimal("-65.20"));
        tx3.setCategory("Food");
        tx3.setAccount("Credit Card");
        tx3.setIsReconciled(false);
        sampleTransactions.add(tx3);

        Transaction tx4 = new Transaction();
        tx4.setDate(LocalDate.of(2025, 4, 15));
        tx4.setDescription("Salary Deposit");
        tx4.setAmount(new BigDecimal("2000.00"));
        tx4.setCategory("Salary");
        tx4.setAccount("Checking Account");
        tx4.setIsReconciled(true);
        sampleTransactions.add(tx4);

        Transaction tx5 = new Transaction();
        tx5.setDate(LocalDate.of(2025, 4, 10));
        tx5.setDescription("Phone Bill");
        tx5.setAmount(new BigDecimal("-55.99"));
        tx5.setCategory("Utilities");
        tx5.setAccount("Checking Account");
        tx5.setIsReconciled(false);
        sampleTransactions.add(tx5);

        transactionRepository.saveAll(sampleTransactions);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public List<Transaction> getTransactionsWithFilters(
            String startDateStr, String endDateStr, String category, String type) {

        LocalDate startDate = startDateStr != null ? LocalDate.parse(startDateStr) : null;
        LocalDate endDate = endDateStr != null ? LocalDate.parse(endDateStr) : null;

        return transactionRepository.findWithFilters(startDate, endDate, category, type);
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Default account if not provided
        if (transaction.getAccount() == null || transaction.getAccount().isEmpty()) {
            transaction.setAccount("Default Account");
        }

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Transaction not found with id: " + id));

        // Update fields if provided
        if (updatedTransaction.getDate() != null) {
            existingTransaction.setDate(updatedTransaction.getDate());
        }

        if (updatedTransaction.getDescription() != null) {
            existingTransaction.setDescription(updatedTransaction.getDescription());
        }

        if (updatedTransaction.getAmount() != null) {
            existingTransaction.setAmount(updatedTransaction.getAmount());
        }

        if (updatedTransaction.getCategory() != null) {
            existingTransaction.setCategory(updatedTransaction.getCategory());
        }

        if (updatedTransaction.getAccount() != null) {
            existingTransaction.setAccount(updatedTransaction.getAccount());
        }

        if (updatedTransaction.getIsReconciled() != null) {
            existingTransaction.setIsReconciled(updatedTransaction.getIsReconciled());
        }

        // Save updated transaction
        return transactionRepository.save(existingTransaction);
    }

    @Transactional
    public boolean deleteTransaction(Long id) {
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, List<String>> getTransactionCategories() {
        List<String> defaultIncomeCategories = Arrays.asList(
                "Salary", "Investments", "Gifts", "Other Income");

        List<String> defaultExpenseCategories = Arrays.asList(
                "Housing", "Food", "Transportation", "Entertainment",
                "Utilities", "Healthcare", "Education", "Shopping", "Other Expenses"
        );

        // Get categories from database
        List<String> dbIncomeCategories = transactionRepository.findDistinctIncomeCategories();
        List<String> dbExpenseCategories = transactionRepository.findDistinctExpenseCategories();

        // Merge default and database categories
        Set<String> incomeCategories = new HashSet<>(defaultIncomeCategories);
        if (dbIncomeCategories != null) {
            incomeCategories.addAll(dbIncomeCategories);
        }

        Set<String> expenseCategories = new HashSet<>(defaultExpenseCategories);
        if (dbExpenseCategories != null) {
            expenseCategories.addAll(dbExpenseCategories);
        }

        Map<String, List<String>> categories = new HashMap<>();
        categories.put("income", new ArrayList<>(incomeCategories));
        categories.put("expense", new ArrayList<>(expenseCategories));

        return categories;
    }
}