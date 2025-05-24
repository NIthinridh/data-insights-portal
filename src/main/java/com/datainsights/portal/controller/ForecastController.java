package com.datainsights.portal.controller;

import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS
})
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        System.out.println("ForecastController initialized");
        System.out.println("ForecastService: " + (forecastService != null ? "OK" : "NULL"));
        System.out.println("UserRepository: " + (userRepository != null ? "OK" : "NULL"));
    }

    @GetMapping("/forecast/test-auth")
    public ResponseEntity<?> testAuth(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authentication != null);
        response.put("username", authentication != null ? authentication.getName() : "anonymous");
        response.put("authorities", authentication != null ? authentication.getAuthorities() : "none");
        response.put("principal", authentication != null ? authentication.getPrincipal() : "none");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<Map<String, Object>>> getForecastData(
            @RequestParam(defaultValue = "6") int months,
            Authentication authentication) {

        System.out.println("=== Forecast endpoint called ===");
        System.out.println("Authentication: " + authentication);
        System.out.println("Username: " + (authentication != null ? authentication.getName() : "null"));

        if (authentication == null) {
            System.out.println("No authentication found!");
            return ResponseEntity.status(401).build();
        }

        try {
            User user = getUserFromAuthentication(authentication);
            System.out.println("User found: " + user.getUsername());

            List<Map<String, Object>> forecastData = forecastService.generateForecast(user, months);
            System.out.println("Forecast data generated: " + (forecastData != null ? forecastData.size() : "null") + " items");

            return ResponseEntity.ok(forecastData);
        } catch (Exception e) {
            System.out.println("ERROR in forecast endpoint: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to see the actual error
        }
    }

    @GetMapping("/forecast/income")
    public ResponseEntity<List<Map<String, Object>>> getIncomeProjection(
            @RequestParam(defaultValue = "6") int months,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = getUserFromAuthentication(authentication);
            List<Map<String, Object>> incomeData = forecastService.generateIncomeProjection(user, months);
            return ResponseEntity.ok(incomeData);
        } catch (Exception e) {
            System.out.println("ERROR in income projection: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/forecast/expenses")
    public ResponseEntity<List<Map<String, Object>>> getExpenseProjection(
            @RequestParam(defaultValue = "6") int months,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = getUserFromAuthentication(authentication);
            List<Map<String, Object>> expenseData = forecastService.generateExpenseProjection(user, months);
            return ResponseEntity.ok(expenseData);
        } catch (Exception e) {
            System.out.println("ERROR in expense projection: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/forecast/savings")
    public ResponseEntity<List<Map<String, Object>>> getSavingsProjection(
            @RequestParam(defaultValue = "6") int months,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = getUserFromAuthentication(authentication);
            List<Map<String, Object>> savingsData = forecastService.generateSavingsProjection(user, months);
            return ResponseEntity.ok(savingsData);
        } catch (Exception e) {
            System.out.println("ERROR in savings projection: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/forecast/custom")
    public ResponseEntity<Map<String, Object>> getCustomForecast(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = getUserFromAuthentication(authentication);
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            Map<String, Object> forecastSummary = forecastService.generateCustomForecast(user, start, end);
            return ResponseEntity.ok(forecastSummary);
        } catch (Exception e) {
            System.out.println("ERROR in custom forecast: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        System.out.println("Looking for user: " + username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }
}