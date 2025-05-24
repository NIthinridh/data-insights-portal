package com.datainsights.portal.service;

import com.datainsights.portal.model.ImportJob;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImportService {

    /**
     * Process an imported file and create an import job
     *
     * @param file The uploaded file
     * @param category The category of data (income, expense, etc.)
     * @param importType The type of import (append, replace)
     * @param description Optional description for the import
     * @param authentication The authenticated user
     * @return The created ImportJob
     */
    ImportJob processImportFile(MultipartFile file, String category, String importType, String description, Authentication authentication);

    /**
     * Get the import history for the authenticated user
     *
     * @param authentication The authenticated user
     * @return List of import jobs
     */
    List<ImportJob> getImportHistory(Authentication authentication);

    /**
     * Get details for a specific import job
     *
     * @param id The import job ID
     * @param authentication The authenticated user
     * @return The import job details
     */
    ImportJob getImportJobById(Long id, Authentication authentication);

    /**
     * Delete an import job
     *
     * @param id The import job ID
     * @param authentication The authenticated user
     * @return true if deleted successfully, false otherwise
     */
    boolean deleteImportJob(Long id, Authentication authentication);
}