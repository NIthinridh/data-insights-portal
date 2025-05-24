package com.datainsights.portal.controller;

import com.datainsights.portal.dto.ImportJobDto;
import com.datainsights.portal.model.ImportJob;
import com.datainsights.portal.service.ImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/data")
public class ImportController {

    private static final Logger logger = LoggerFactory.getLogger(ImportController.class);

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/import")
    public ResponseEntity<?> importFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "importType", required = false) String importType,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {

        logger.info("File upload request received: {}, size: {} bytes, category: {}, importType: {}",
                file.getOriginalFilename(), file.getSize(), category, importType);

        if (authentication != null) {
            logger.info("User authenticated: {}", authentication.getName());
        } else {
            logger.warn("No authentication found for file upload request!");
            return ResponseEntity.status(401).body("User not authenticated");
        }

        if (file.isEmpty()) {
            logger.warn("Uploaded file is empty");
            return ResponseEntity.badRequest().body("Please upload a non-empty file");
        }

        try {
            ImportJob importJob = importService.processImportFile(file, category, importType, description, authentication);

            // Convert to DTO to control what data is sent to the client
            ImportJobDto dto = new ImportJobDto(
                    importJob.getId(),
                    importJob.getFileName(),
                    importJob.getCategory(),
                    importJob.getImportType(),
                    importJob.getStatus(),
                    importJob.getRecordCount(),
                    importJob.getCreatedAt(),
                    importJob.getCompletedAt()
            );

            logger.info("File imported successfully: {}", file.getOriginalFilename());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error importing file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error importing file: " + e.getMessage());
        }
    }

    @GetMapping("/imports")
    public ResponseEntity<?> getImportHistory(Authentication authentication) {
        logger.info("Import history requested");

        List<ImportJob> importJobs = importService.getImportHistory(authentication);

        // Convert to DTOs with new fields
        List<ImportJobDto> dtos = importJobs.stream()
                .map(job -> new ImportJobDto(
                        job.getId(),
                        job.getFileName(),
                        job.getCategory(),
                        job.getImportType(),
                        job.getStatus(),
                        job.getRecordCount(),
                        job.getCreatedAt(),
                        job.getCompletedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/imports/{id}")
    public ResponseEntity<?> getImportJobDetails(@PathVariable Long id, Authentication authentication) {
        logger.info("Import job details requested for ID: {}", id);

        try {
            ImportJob importJob = importService.getImportJobById(id, authentication);

            if (importJob == null) {
                return ResponseEntity.notFound().build();
            }

            ImportJobDto dto = new ImportJobDto(
                    importJob.getId(),
                    importJob.getFileName(),
                    importJob.getCategory(),
                    importJob.getImportType(),
                    importJob.getStatus(),
                    importJob.getRecordCount(),
                    importJob.getCreatedAt(),
                    importJob.getCompletedAt()
            );

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error retrieving import job details: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error retrieving import job details: " + e.getMessage());
        }
    }

    @DeleteMapping("/imports/{id}")
    public ResponseEntity<?> deleteImportJob(@PathVariable Long id, Authentication authentication) {
        logger.info("Delete import job requested for ID: {}", id);

        try {
            boolean deleted = importService.deleteImportJob(id, authentication);

            if (deleted) {
                return ResponseEntity.ok().body("Import job deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting import job: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error deleting import job: " + e.getMessage());
        }
    }
}