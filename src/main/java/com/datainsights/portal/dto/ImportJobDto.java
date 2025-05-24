package com.datainsights.portal.dto;

import java.time.LocalDateTime;

public class ImportJobDto {

    private Long id;
    private String fileName;
    private String category;      // Added field
    private String importType;    // Added field
    private String status;
    private Integer recordCount;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    // Default constructor for JSON serialization
    public ImportJobDto() {
    }

    public ImportJobDto(Long id, String fileName, String category, String importType,
                        String status, Integer recordCount,
                        LocalDateTime createdAt, LocalDateTime completedAt) {
        this.id = id;
        this.fileName = fileName;
        this.category = category;
        this.importType = importType;
        this.status = status;
        this.recordCount = recordCount;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    // Original getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(Integer recordCount) {
        this.recordCount = recordCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    // New getters and setters for the added fields
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImportType() {
        return importType;
    }

    public void setImportType(String importType) {
        this.importType = importType;
    }
}