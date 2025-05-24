package com.datainsights.portal.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String uri = request.getRequestURI();
            String method = request.getMethod();
            logger.debug("JwtAuthenticationFilter processing request: {} {}", method, uri);

            // Log all headers for debugging
            logRequestHeaders(request);

            // For financial endpoints specifically, add extra logging
            if (uri.startsWith("/api/financial")) {
                logger.info("Processing financial endpoint request: {} {}", method, uri);
            }

            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                logger.debug("JWT token found in request: {}",
                        jwt.length() > 10 ? jwt.substring(0, 10) + "..." : jwt);

                if (tokenProvider.validateToken(jwt)) {
                    logger.debug("JWT token validated successfully");

                    // Get user details from the token
                    UserDetails userDetails = tokenProvider.getUserDetailsFromJWT(jwt);
                    logger.debug("Extracted user details: {}, authorities: {}",
                            userDetails.getUsername(), userDetails.getAuthorities());

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    // Add request details
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Authentication set in SecurityContextHolder for: {} {}", method, uri);

                    // For financial endpoints, add confirmation log
                    if (uri.startsWith("/api/financial")) {
                        logger.info("Authentication successfully set for financial endpoint: {} {}", method, uri);
                    }
                } else {
                    logger.warn("Invalid JWT token for request: {} {}", method, uri);
                    if (uri.startsWith("/api/financial")) {
                        logger.error("JWT validation failed for financial endpoint access");
                    }
                }
            } else {
                logger.debug("No JWT token found in request: {} {}", method, uri);
                if (uri.startsWith("/api/financial")) {
                    logger.warn("Attempted to access financial endpoint without JWT token: {} {}", method, uri);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for request: {} {}",
                    request.getMethod(), request.getRequestURI(), ex);
        }

        filterChain.doFilter(request, response);
    }

    private void logRequestHeaders(HttpServletRequest request) {
        Enumeration<String> headerNames = request.getHeaderNames();
        StringBuilder headers = new StringBuilder("Request Headers: ");

        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);

            // Mask authorization header value for security
            if ("authorization".equalsIgnoreCase(headerName) && headerValue != null) {
                headerValue = headerValue.substring(0, Math.min(15, headerValue.length())) + "...";
            }

            headers.append(headerName).append("=").append(headerValue).append(", ");
        }

        logger.debug(headers.toString());
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", bearerToken != null ?
                (bearerToken.substring(0, Math.min(15, bearerToken.length())) + "...") : "null");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}