package com.datainsights.portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diagnostic")
public class DiagnosticController {

    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("Public endpoint working! This confirms your API is accessible.");
    }

    @GetMapping("/authenticated")
    public ResponseEntity<String> authenticatedEndpoint(Authentication authentication) {
        if (authentication != null) {
            return ResponseEntity.ok("Authentication working! User: " + authentication.getName() +
                    ", Authorities: " + authentication.getAuthorities());
        } else {
            return ResponseEntity.ok("Authentication object is null - this means authentication failed!");
        }
    }

    @GetMapping("/auth-check")
    public ResponseEntity<?> authCheck() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> result = new HashMap<>();
        result.put("authenticated", auth != null && auth.isAuthenticated());
        result.put("principal", auth != null ? auth.getPrincipal().toString() : "none");
        result.put("authorities", auth != null ? auth.getAuthorities().toString() : "none");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload-test")
    public ResponseEntity<String> uploadTest(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty!");
        }
        return ResponseEntity.ok("File received successfully! Name: " + file.getOriginalFilename() +
                ", Size: " + file.getSize() + " bytes, Content Type: " + file.getContentType());
    }

    @GetMapping("/headers")
    public ResponseEntity<Map<String, String>> headersTest(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);

            // Mask authorization header for security
            if ("authorization".equalsIgnoreCase(headerName) && headerValue != null) {
                headerValue = headerValue.substring(0, Math.min(15, headerValue.length())) + "...";
            }

            headers.put(headerName, headerValue);
        }
        return ResponseEntity.ok(headers);
    }

    @GetMapping("/token-debug")
    public ResponseEntity<?> tokenDebug(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> debug = new HashMap<>();
        debug.put("authHeader", authHeader != null ?
                (authHeader.length() > 15 ? authHeader.substring(0, 15) + "..." : authHeader) : "null");
        debug.put("authenticated", auth != null && auth.isAuthenticated());
        debug.put("authName", auth != null ? auth.getName() : "null");
        debug.put("authorities", auth != null ? auth.getAuthorities().toString() : "null");

        return ResponseEntity.ok(debug);
    }
}