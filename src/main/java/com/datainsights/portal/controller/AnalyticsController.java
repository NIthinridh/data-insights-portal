package com.datainsights.portal.controller;

import com.datainsights.portal.model.mongo.AnalyticsResult;
import com.datainsights.portal.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for financial analytics operations
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Get a financial summary for a specified date range
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getFinancialSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        logger.info("Financial summary requested from {} to {}", startDate, endDate);

        try {
            Map<String, Object> summary = analyticsService.getFinancialSummary(startDate, endDate, authentication);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error generating financial summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error generating financial summary: " + e.getMessage());
        }
    }

    /**
     * Get a breakdown of spending by category
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategoryBreakdown(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {

        logger.info("Category breakdown requested from {} to {}", startDate, endDate);

        try {
            Map<String, Object> breakdown = analyticsService.getCategoryBreakdown(startDate, endDate, authentication);
            return ResponseEntity.ok(breakdown);
        } catch (Exception e) {
            logger.error("Error generating category breakdown: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error generating category breakdown: " + e.getMessage());
        }
    }

    /**
     * Get trend data for financial metrics over time
     */
    @GetMapping("/trends")
    public ResponseEntity<?> getFinancialTrends(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "monthly") String interval,
            Authentication authentication) {

        logger.info("Financial trends requested from {} to {} with interval {}", startDate, endDate, interval);

        // Validate interval parameter
        if (!interval.equalsIgnoreCase("daily") &&
                !interval.equalsIgnoreCase("weekly") &&
                !interval.equalsIgnoreCase("monthly")) {
            return ResponseEntity.badRequest().body("Invalid interval. Must be one of: daily, weekly, monthly");
        }

        try {
            List<Map<String, Object>> trends = analyticsService.getFinancialTrends(
                    startDate, endDate, interval, authentication);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            logger.error("Error generating financial trends: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error generating financial trends: " + e.getMessage());
        }
    }

    /**
     * Get history of saved analytics results
     */
    @GetMapping("/history")
    public ResponseEntity<?> getAnalyticsHistory(Authentication authentication) {
        logger.info("Analytics history requested");

        try {
            List<AnalyticsResult> history = analyticsService.getAnalyticsHistory(authentication);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Error retrieving analytics history: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error retrieving analytics history: " + e.getMessage());
        }
    }
}
