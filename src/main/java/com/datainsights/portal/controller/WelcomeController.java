package com.datainsights.portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Data Insights Portal");
        response.put("version", "1.0.0");
        response.put("status", "Running");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Welcome to Data Insights Portal - Your Financial Analytics Platform");
        response.put("endpoints", Map.of(
                "health", "/api/health",
                "users", "/api/users",
                "auth", "/api/auth",
                "data", "/api/financial-data"
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/robots.txt")
    public ResponseEntity<String> robots() {
        String robots = """
            User-agent: *
            Allow: /
            
            # Data Insights Portal
            Sitemap: https://data-insights-portal-production.up.railway.app/sitemap.xml
            """;
        return ResponseEntity.ok()
                .header("Content-Type", "text/plain")
                .body(robots);
    }
}