package com.datainsights.portal.config;

import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitialization implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Create test user if it doesn't exist
            if (!userRepository.existsByUsername("testuser")) {
                User testUser = new User();
                testUser.setUsername("testuser");
                testUser.setEmail("test@example.com");
                testUser.setPasswordHash(passwordEncoder.encode("password"));
                testUser.setFirstName("Test");
                testUser.setLastName("User");
                testUser.setRole("USER");
                testUser.setActive(true);  // Correct method name
                testUser.setCreatedAt(LocalDateTime.now());

                userRepository.save(testUser);
                System.out.println("✅ Test user created: username=testuser, password=password");
            }

            // Create admin user if it doesn't exist
            if (!userRepository.existsByUsername("admin")) {
                User adminUser = new User();
                adminUser.setUsername("admin");
                adminUser.setEmail("admin@example.com");
                adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
                adminUser.setFirstName("Admin");
                adminUser.setLastName("User");
                adminUser.setRole("ADMIN");
                adminUser.setActive(true);  // Correct method name
                adminUser.setCreatedAt(LocalDateTime.now());

                userRepository.save(adminUser);
                System.out.println("✅ Admin user created: username=admin, password=admin123");
            }

        } catch (Exception e) {
            System.err.println("Error creating test users: " + e.getMessage());
            e.printStackTrace();
        }
    }
}