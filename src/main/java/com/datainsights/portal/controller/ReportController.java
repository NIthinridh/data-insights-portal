package com.datainsights.portal.controller;

import com.datainsights.portal.dto.ReportRequest;
import com.datainsights.portal.dto.ReportResponse;
import com.datainsights.portal.model.Report;
import com.datainsights.portal.service.ReportService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for report management and generation
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Get all reports accessible by the current user
     */
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports(Authentication authentication) {
        logger.info("Getting all reports");

        List<Report> reports = reportService.getAllReports(authentication);
        List<ReportResponse> reportResponses = reports.stream()
                .map(reportService::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reportResponses);
    }

    /**
     * Get a specific report by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable Long id, Authentication authentication) {
        logger.info("Getting report with ID: {}", id);

        Report report = reportService.getReportById(id, authentication);

        if (report == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reportService.convertToDto(report));
    }

    /**
     * Create a new report
     */
    @PostMapping
    public ResponseEntity<?> createReport(@Valid @RequestBody ReportRequest reportRequest,
                                          Authentication authentication) {
        logger.info("Creating new report: {}", reportRequest.getName());

        try {
            Report createdReport = reportService.createReport(reportRequest, authentication);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(reportService.convertToDto(createdReport));
        } catch (Exception e) {
            logger.error("Error creating report: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body("Error creating report: " + e.getMessage());
        }
    }

    /**
     * Update an existing report
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(@PathVariable Long id,
                                          @Valid @RequestBody ReportRequest reportRequest,
                                          Authentication authentication) {
        logger.info("Updating report with ID: {}", id);

        Report updatedReport = reportService.updateReport(id, reportRequest, authentication);

        if (updatedReport == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reportService.convertToDto(updatedReport));
    }

    /**
     * Delete a report
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id, Authentication authentication) {
        logger.info("Deleting report with ID: {}", id);

        boolean deleted = reportService.deleteReport(id, authentication);

        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Generate report data
     */
    @PostMapping("/{id}/generate")
    public ResponseEntity<?> generateReport(@PathVariable Long id,
                                            @RequestBody(required = false) Map<String, Object> parameters,
                                            Authentication authentication) {
        logger.info("Generating report with ID: {}", id);

        Map<String, Object> reportData = reportService.generateReportData(
                id, parameters, authentication);

        if (reportData == null) {
            return ResponseEntity.notFound().build();
        }

        if (reportData.containsKey("error")) {
            return ResponseEntity.badRequest().body(reportData);
        }

        return ResponseEntity.ok(reportData);
    }

    /**
     * Export report to specified format
     */
    @GetMapping("/{id}/export")
    public ResponseEntity<?> exportReport(@PathVariable Long id,
                                          @RequestParam String format,
                                          @RequestParam(required = false) Map<String, Object> parameters,
                                          Authentication authentication) {
        logger.info("Exporting report with ID: {} as {}", id, format);

        byte[] reportContent = reportService.exportReport(id, format, parameters, authentication);

        if (reportContent == null) {
            return ResponseEntity.badRequest()
                    .body("Error exporting report or unsupported format");
        }

        // Set appropriate content type and headers based on format
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "report." + format.toLowerCase());

        switch (format.toUpperCase()) {
            case "CSV":
                headers.setContentType(MediaType.parseMediaType("text/csv"));
                break;
            case "EXCEL":
                headers.setContentType(MediaType.parseMediaType("application/vnd.ms-excel"));
                break;
            case "PDF":
                headers.setContentType(MediaType.APPLICATION_PDF);
                break;
            default:
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }

        return new ResponseEntity<>(reportContent, headers, HttpStatus.OK);
    }

    /**
     * Get reports by type
     */
    @GetMapping(params = "type")
    public ResponseEntity<List<ReportResponse>> getReportsByType(
            @RequestParam String type, Authentication authentication) {
        logger.info("Getting reports of type: {}", type);

        List<Report> reports = reportService.getAllReports(authentication)
                .stream()
                .filter(report -> type.equals(report.getType()))
                .collect(Collectors.toList());

        List<ReportResponse> reportResponses = reports.stream()
                .map(reportService::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reportResponses);
    }
}