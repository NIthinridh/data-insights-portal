package com.datainsights.portal.repository;

import com.datainsights.portal.model.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportJobRepository extends JpaRepository<ImportJob, Long> {

    /**
     * Find all import jobs for a specific user, ordered by creation date
     *
     * @param userId The user ID
     * @return List of import jobs
     */
    List<ImportJob> findByCreatedByOrderByCreatedAtDesc(Long userId);
}