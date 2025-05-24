package com.datainsights.portal.config;

import com.datainsights.portal.security.JwtAuthenticationFilter;
import com.datainsights.portal.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtTokenProvider tokenProvider;

    public SecurityConfig(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filter chain with React frontend support");

        http
                // Enable CORS and disable CSRF
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                // Configure authorization rules
                .authorizeHttpRequests(auth -> {
                    // Public endpoints - Health and diagnostics
                    auth.requestMatchers("/api/health/**", "/api/ping").permitAll()
                            .requestMatchers("/actuator/health").permitAll()

                            // Static resources for React frontend
                            .requestMatchers("/", "/index.html").permitAll()
                            .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**", "/fonts/**").permitAll()
                            .requestMatchers("/favicon.ico", "/logo*.png", "/manifest.json", "/robots.txt").permitAll()
                            .requestMatchers("/*.js", "/*.css", "/*.map").permitAll()

                            // React Router - Allow all frontend routes
                            .requestMatchers("/dashboard/**", "/login", "/register", "/profile/**", "/analytics/**").permitAll()
                            .requestMatchers("/budget/**", "/goals/**", "/reports/**", "/transactions/**").permitAll()

                            // Auth endpoints
                            .requestMatchers("/api/auth/**").permitAll()
                            .requestMatchers("/api/diagnostic/**").permitAll()

                            // TEMPORARY: Allow all API endpoints for testing
                            .requestMatchers("/api/**").permitAll()

                            // Allow all OPTIONS requests for CORS preflight
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            // Allow all requests for initial testing
                            .anyRequest().permitAll();

                    logger.info("Security authorization rules configured - FRONTEND + API MODE");
                })

                // Use stateless session management (no session cookies)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add our JWT token filter before Spring's authentication filter
                .addFilterBefore(
                        new JwtAuthenticationFilter(tokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                );

        logger.info("Security filter chain configured successfully with React support");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow Railway domain and localhost for development
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "*",  // Allow all for testing
                "https://data-insights-portal-production.up.railway.app",
                "http://localhost:3000",
                "http://localhost:8080"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        logger.info("CORS configuration set up for React frontend");
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}