package com.datainsights.portal.controller;

import com.datainsights.portal.service.FinancialHealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000")
public class FinancialHealthController {

    private static final Logger logger = LoggerFactory.getLogger(FinancialHealthController.class);

    @Autowired
    private FinancialHealthService financialHealthService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getFinancialHealth(
            @AuthenticationPrincipal UserDetails userDetails) {
        logger.info("Received request for financial health data for user: {}", userDetails.getUsername());
        Map<String, Object> healthData = financialHealthService.getFinancialHealth(userDetails.getUsername());
        logger.info("Returning financial health data with overall score: {}", healthData.get("overallScore"));
        return ResponseEntity.ok(healthData);
    }

    @GetMapping("/health/history")
    public ResponseEntity<List<Map<String, Object>>> getHealthHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "6") int months) {
        logger.info("Received request for health history for user: {}", userDetails.getUsername());
        return ResponseEntity.ok(financialHealthService.getHealthHistory(userDetails.getUsername(), months));
    }

    @GetMapping("/health/categories")
    public ResponseEntity<List<Map<String, Object>>> getHealthCategories() {
        logger.info("Received request for financial health categories");
        return ResponseEntity.ok(financialHealthService.getHealthCategories());
    }

    @PostMapping("/health/goals")
    public ResponseEntity<Map<String, Object>> updateHealthGoals(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> goals) {
        logger.info("Received request to update financial health goals for user: {}", userDetails.getUsername());
        return ResponseEntity.ok(financialHealthService.updateHealthGoals(userDetails.getUsername(), goals));
    }
}