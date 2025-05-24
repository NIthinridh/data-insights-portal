package com.datainsights.portal.controller;

import com.datainsights.portal.model.Transaction;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/financial/tx")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    private final TransactionService transactionService;
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Get all transactions with optional filtering
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {

        logger.info("Receiving request for transactions with filters: startDate={}, endDate={}, category={}, type={}",
                startDate, endDate, category, type);

        try {
            List<Transaction> transactions = transactionService.getTransactionsWithFilters(
                    startDate, endDate, category, type);

            logger.info("Found {} transactions matching filters", transactions.size());
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            logger.error("Error retrieving transactions: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving transactions: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Get transaction by ID
    @GetMapping("/transaction/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        logger.info("Receiving request for transaction with ID: {}", id);

        try {
            Transaction transaction = transactionService.getTransactionById(id);

            if (transaction != null) {
                logger.info("Found transaction with ID: {}", id);
                return ResponseEntity.ok(transaction);
            } else {
                logger.warn("Transaction not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Transaction not found with id: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving transaction with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Create a new transaction
    @PostMapping("/transaction")
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        logger.info("Receiving request to create transaction: {}", transaction);

        try {
            // Get the authenticated user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Set the user who created this transaction
            transaction.setCreatedBy(user.getId());

            // Set created date if not provided
            if (transaction.getCreatedAt() == null) {
                transaction.setCreatedAt(LocalDate.now());
            }

            // Save the transaction
            Transaction savedTransaction = transactionService.createTransaction(transaction);
            logger.info("Transaction created with ID: {} for user: {}", savedTransaction.getId(), username);
            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            logger.error("Error creating transaction: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update transaction
    @PutMapping("/transaction/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @RequestBody Transaction updatedTransaction) {

        logger.info("Receiving request to update transaction with ID {}: {}", id, updatedTransaction);

        try {
            Transaction transaction = transactionService.updateTransaction(id, updatedTransaction);
            logger.info("Transaction with ID {} updated successfully", id);
            return ResponseEntity.ok(transaction);
        } catch (NoSuchElementException e) {
            logger.warn("Transaction not found with ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating transaction with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Delete transaction
    @DeleteMapping("/transaction/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        logger.info("Receiving request to delete transaction with ID: {}", id);

        try {
            boolean deleted = transactionService.deleteTransaction(id);

            if (deleted) {
                logger.info("Transaction with ID {} deleted successfully", id);
                Map<String, Object> response = new HashMap<>();
                response.put("id", id);
                response.put("message", "Transaction deleted successfully");
                response.put("deleted", true);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Transaction not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Transaction not found with id: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting transaction with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Transaction categories
    @GetMapping("/categories")
    public ResponseEntity<?> getTransactionCategories() {
        logger.info("Receiving request for transaction categories");

        try {
            Map<String, List<String>> categories = transactionService.getTransactionCategories();
            logger.info("Returning categories: {}", categories);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error retrieving categories: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving categories: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Alternative GET endpoint for creating transactions
    @GetMapping("/transaction/create")
    public ResponseEntity<?> createTransactionViaGet(
            @RequestParam String date,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String amount,
            @RequestParam(required = false, defaultValue = "Default Account") String account,
            @RequestParam(required = false, defaultValue = "false") Boolean isReconciled) {

        logger.info("Receiving GET request to create transaction: date={}, description={}, category={}, amount={}, account={}, isReconciled={}",
                date, description, category, amount, account, isReconciled);

        try {
            // Get the authenticated user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create a transaction object from the parameters
            Transaction transaction = new Transaction();
            transaction.setDate(LocalDate.parse(date));
            transaction.setDescription(description);
            transaction.setCategory(category);
            transaction.setAmount(new BigDecimal(amount));
            transaction.setAccount(account);
            transaction.setIsReconciled(isReconciled);
            transaction.setCreatedBy(user.getId());
            transaction.setCreatedAt(LocalDate.now());

            // Save the transaction
            Transaction savedTransaction = transactionService.createTransaction(transaction);
            logger.info("Transaction created via GET with ID: {} for user: {}", savedTransaction.getId(), username);
            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            logger.error("Error creating transaction via GET: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Alternative GET endpoint for updating transactions
    @GetMapping("/transaction/update/{id}")
    public ResponseEntity<?> updateTransactionViaGet(
            @PathVariable Long id,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String amount,
            @RequestParam(required = false) String account,
            @RequestParam(required = false) Boolean isReconciled) {

        logger.info("Receiving GET request to update transaction with ID {}: date={}, description={}, category={}, amount={}, account={}, isReconciled={}",
                id, date, description, category, amount, account, isReconciled);

        try {
            // Create a transaction object with the updated fields
            Transaction updatedFields = new Transaction();

            if (date != null) updatedFields.setDate(LocalDate.parse(date));
            if (description != null) updatedFields.setDescription(description);
            if (category != null) updatedFields.setCategory(category);
            if (amount != null) updatedFields.setAmount(new BigDecimal(amount));
            if (account != null) updatedFields.setAccount(account);
            if (isReconciled != null) updatedFields.setIsReconciled(isReconciled);

            Transaction transaction = transactionService.updateTransaction(id, updatedFields);
            logger.info("Transaction with ID {} updated successfully via GET", id);
            return ResponseEntity.ok(transaction);
        } catch (NoSuchElementException e) {
            logger.warn("Transaction not found with ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating transaction with ID {} via GET: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Alternative GET endpoint for deleting transactions
    @GetMapping("/transaction/delete/{id}")
    public ResponseEntity<?> deleteTransactionViaGet(@PathVariable Long id) {
        logger.info("Receiving GET request to delete transaction with ID: {}", id);

        try {
            boolean deleted = transactionService.deleteTransaction(id);

            if (deleted) {
                logger.info("Transaction with ID {} deleted successfully via GET", id);
                Map<String, Object> response = new HashMap<>();
                response.put("id", id);
                response.put("message", "Transaction deleted successfully");
                response.put("deleted", true);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Transaction not found with ID: {}", id);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Transaction not found with id: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting transaction with ID {} via GET: {}", id, e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting transaction: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}