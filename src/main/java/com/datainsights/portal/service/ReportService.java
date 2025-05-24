package com.datainsights.portal.service;

import com.datainsights.portal.dto.ReportRequest;
import com.datainsights.portal.dto.ReportResponse;
import com.datainsights.portal.model.Report;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.ReportRepository;
import com.datainsights.portal.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, ObjectMapper objectMapper) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public List<Report> getAllReports(Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);

        // Get user's own reports and public reports
        List<Report> reports = reportRepository.findByCreatedByOrIsPublicTrue(currentUser.getId());
        logger.info("Found {} reports for user {}", reports.size(), currentUser.getUsername());

        return reports;
    }

    public Report getReportById(Long id, Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);

        Report report = reportRepository.findById(id).orElse(null);

        // Check if report exists and user has access to it
        if (report != null && (report.isPublic() || report.getCreatedBy().equals(currentUser.getId()))) {
            return report;
        }

        return null;
    }

    public Report createReport(ReportRequest reportRequest, Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);

        try {
            Report report = new Report();
            report.setName(reportRequest.getName());
            report.setDescription(reportRequest.getDescription());
            report.setType(reportRequest.getType());
            report.setPublic(reportRequest.isPublic());
            report.setCreatedBy(currentUser.getId());
            report.setCreatedAt(LocalDateTime.now());
            report.setLastModified(LocalDateTime.now());

            // Convert configuration to JSON string
            if (reportRequest.getConfiguration() != null) {
                report.setConfiguration(objectMapper.writeValueAsString(reportRequest.getConfiguration()));
            }

            return reportRepository.save(report);
        } catch (Exception e) {
            logger.error("Error creating report: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating report: " + e.getMessage());
        }
    }

    public Report updateReport(Long id, ReportRequest reportRequest, Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);

        Report existingReport = reportRepository.findById(id).orElse(null);

        if (existingReport == null || !existingReport.getCreatedBy().equals(currentUser.getId())) {
            return null;
        }

        try {
            existingReport.setName(reportRequest.getName());
            existingReport.setDescription(reportRequest.getDescription());
            existingReport.setType(reportRequest.getType());
            existingReport.setPublic(reportRequest.isPublic());
            existingReport.setLastModified(LocalDateTime.now());

            // Update configuration
            if (reportRequest.getConfiguration() != null) {
                existingReport.setConfiguration(objectMapper.writeValueAsString(reportRequest.getConfiguration()));
            }

            return reportRepository.save(existingReport);
        } catch (Exception e) {
            logger.error("Error updating report: {}", e.getMessage(), e);
            throw new RuntimeException("Error updating report: " + e.getMessage());
        }
    }

    public boolean deleteReport(Long id, Authentication authentication) {
        User currentUser = getUserFromAuthentication(authentication);

        Report report = reportRepository.findById(id).orElse(null);

        if (report != null && report.getCreatedBy().equals(currentUser.getId())) {
            reportRepository.delete(report);
            return true;
        }

        return false;
    }

    public Map<String, Object> generateReportData(Long id, Map<String, Object> parameters, Authentication authentication) {
        Report report = getReportById(id, authentication);

        if (report == null) {
            return null;
        }

        try {
            // In a real implementation, this would generate actual report data based on the report type and parameters
            // For now, we'll return sample data
            Map<String, Object> reportData = new HashMap<>();

            // Add report metadata
            reportData.put("id", report.getId());
            reportData.put("name", report.getName());
            reportData.put("type", report.getType());

            // Add sample data based on report type
            if ("financial".equals(report.getType())) {
                reportData.put("totalIncome", 6500.00);
                reportData.put("totalExpenses", 4200.00);
                reportData.put("netSavings", 2300.00);
                reportData.put("savingsRate", 35.4);

                // Add sample categories
                reportData.put("categories", List.of(
                        Map.of("name", "Housing", "amount", 1500.00, "percentage", 35.7),
                        Map.of("name", "Food", "amount", 800.00, "percentage", 19.0),
                        Map.of("name", "Transportation", "amount", 500.00, "percentage", 11.9),
                        Map.of("name", "Entertainment", "amount", 300.00, "percentage", 7.1),
                        Map.of("name", "Utilities", "amount", 550.00, "percentage", 13.1),
                        Map.of("name", "Other", "amount", 550.00, "percentage", 13.1)
                ));
            } else if ("analytics".equals(report.getType())) {
                // Sample analytics data
                reportData.put("trends", List.of(
                        Map.of("month", "Jan", "value", 4200),
                        Map.of("month", "Feb", "value", 4500),
                        Map.of("month", "Mar", "value", 4100),
                        Map.of("month", "Apr", "value", 5200),
                        Map.of("month", "May", "value", 4800),
                        Map.of("month", "Jun", "value", 5500)
                ));

                reportData.put("insights", List.of(
                        "Spending has increased by 15% in the last month",
                        "Savings rate has improved by 5% compared to last quarter",
                        "Largest expense category is Housing at 35.7%"
                ));
            }

            return reportData;
        } catch (Exception e) {
            logger.error("Error generating report data: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate report data: " + e.getMessage());
            return errorResponse;
        }
    }

    public byte[] exportReport(Long id, String format, Map<String, Object> parameters, Authentication authentication) {
        // In a real implementation, this would generate a file in the specified format
        // For now, we'll just return some sample content
        Report report = getReportById(id, authentication);

        if (report == null) {
            return null;
        }

        try {
            // Generate sample content based on format
            String content = "Report: " + report.getName() + "\n";
            content += "Type: " + report.getType() + "\n";
            content += "Generated on: " + LocalDateTime.now() + "\n\n";

            // Add some sample data
            content += "Sample report data for demonstration purposes.\n";
            content += "In a real implementation, this would contain actual report data formatted accordingly.";

            return content.getBytes();
        } catch (Exception e) {
            logger.error("Error exporting report: {}", e.getMessage(), e);
            return null;
        }
    }

    public ReportResponse convertToDto(Report report) {
        ReportResponse dto = new ReportResponse();
        dto.setId(report.getId());
        dto.setName(report.getName());
        dto.setDescription(report.getDescription());
        dto.setType(report.getType());
        dto.setPublic(report.isPublic());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setLastModified(report.getLastModified());

        // Get username of creator
        userRepository.findById(report.getCreatedBy()).ifPresent(user ->
                dto.setCreatedByUsername(user.getUsername())
        );

        return dto;
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}