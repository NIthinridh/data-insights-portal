package com.datainsights.portal.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @GetMapping("/auth")
    public ResponseEntity<String> testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Auth test endpoint called with authentication: {}", auth);

        if (auth != null && auth.isAuthenticated()) {
            return ResponseEntity.ok("Authentication successful! User: " + auth.getName() +
                    ", Authorities: " + auth.getAuthorities());
        } else {
            return ResponseEntity.status(401).body("Not authenticated");
        }
    }
}