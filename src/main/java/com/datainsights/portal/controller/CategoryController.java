package com.datainsights.portal.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
public class CategoryController {

    // List of predefined transaction categories
    private final List<String> transactionCategories = Arrays.asList(
            "Housing",
            "Food",
            "Transportation",
            "Entertainment",
            "Utilities",
            "Healthcare",
            "Education",
            "Shopping",
            "Personal",
            "Salary",
            "Investments",
            "Gifts",
            "Other"
    );

    // Get all transaction categories - using a different endpoint path to avoid conflicts
    @GetMapping("/transaction-categories")
    public ResponseEntity<List<String>> getTransactionCategories() {
        return ResponseEntity.ok(transactionCategories);
    }

    // Add a new category (if needed in the future)
    @PostMapping("/transaction-categories")
    public ResponseEntity<List<String>> addCategory(@RequestBody Map<String, String> payload) {
        String newCategory = payload.get("category");
        if (newCategory != null && !newCategory.isEmpty() && !transactionCategories.contains(newCategory)) {
            List<String> updatedCategories = new ArrayList<>(transactionCategories);
            updatedCategories.add(newCategory);
            return ResponseEntity.ok(updatedCategories);
        }
        return ResponseEntity.ok(transactionCategories);
    }
}