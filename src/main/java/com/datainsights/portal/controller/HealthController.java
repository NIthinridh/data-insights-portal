package com.datainsights.portal.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> healthCheck() {
        logger.info("Health check requested");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "Data Insights Portal");
        response.put("version", "1.0");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/database")
    public ResponseEntity<?> databaseHealthCheck() {
        logger.info("Database health check requested");
        Map<String, Object> response = new HashMap<>();

        try {
            if (jdbcTemplate != null) {
                // Test SQL Server connection
                boolean sqlServerConnected = testSqlServerConnection();
                response.put("sqlServer", sqlServerConnected ? "UP" : "DOWN");
                response.put("status", sqlServerConnected ? "UP" : "PARTIAL");
            } else {
                response.put("sqlServer", "NOT CONFIGURED");
                response.put("status", "PARTIAL");
            }

            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Database health check failed", e);
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(503).body(response);
        }
    }

    private boolean testSqlServerConnection() {
        try {
            // Simple query to test connection
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return result != null && result == 1;
        } catch (Exception e) {
            logger.error("SQL Server connection test failed", e);
            return false;
        }
    }
}