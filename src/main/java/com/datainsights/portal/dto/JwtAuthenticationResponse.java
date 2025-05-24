package com.datainsights.portal.dto;

import lombok.Data;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;  // Changed to Long to match User model
    private String username;
    private String email;
    private String role;

    public JwtAuthenticationResponse(String accessToken, Long id, String username, String email, String role) {
        this.accessToken = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}