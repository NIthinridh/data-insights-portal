package com.datainsights.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties
@EnableJpaRepositories(basePackages = {"com.datainsights.portal.repository", "com.datainsights.portal.repository.sql"})
@EnableMongoRepositories(basePackages = "com.datainsights.portal.repository.mongodb")
@EnableAsync
@EnableScheduling
public class DataInsightsPortalApplication {

    public static void main(String[] args) {
        // Set system properties for better cloud deployment
        System.setProperty("spring.devtools.restart.enabled", "false");
        System.setProperty("spring.jpa.open-in-view", "false");

        // Railway-specific optimizations
        System.setProperty("java.awt.headless", "true");
        System.setProperty("spring.main.lazy-initialization", "true");

        // Detect Railway environment
        String profile = System.getenv("RAILWAY_ENVIRONMENT") != null ? "railway" : "local";
        System.setProperty("spring.profiles.active", profile);

        SpringApplication application = new SpringApplication(DataInsightsPortalApplication.class);

        // Disable banner to save startup time
        application.setBannerMode(org.springframework.boot.Banner.Mode.OFF);

        // Add shutdown hook for graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Data Insights Portal is shutting down gracefully...");
        }));

        try {
            System.out.println("Starting Data Insights Portal...");
            System.out.println("Active Profile: " + profile);
            System.out.println("Port: " + System.getenv().getOrDefault("PORT", "8080"));

            application.run(args);

            System.out.println("Data Insights Portal started successfully!");
        } catch (Exception e) {
            System.err.println("Failed to start Data Insights Portal: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}