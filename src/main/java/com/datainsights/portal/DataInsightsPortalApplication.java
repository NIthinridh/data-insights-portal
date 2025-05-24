package com.datainsights.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
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

        SpringApplication application = new SpringApplication(DataInsightsPortalApplication.class);

        // Add shutdown hook for graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Data Insights Portal is shutting down gracefully...");
        }));

        application.run(args);
    }
}