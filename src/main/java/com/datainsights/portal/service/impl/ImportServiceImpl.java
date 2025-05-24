package com.datainsights.portal.service.impl;

import com.datainsights.portal.model.ImportJob;
import com.datainsights.portal.model.User;
import com.datainsights.portal.repository.ImportJobRepository;
import com.datainsights.portal.repository.UserRepository;
import com.datainsights.portal.service.ImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ImportServiceImpl implements ImportService {

    private static final Logger logger = LoggerFactory.getLogger(ImportServiceImpl.class);

    private final ImportJobRepository importJobRepository;
    private final UserRepository userRepository;

    public ImportServiceImpl(ImportJobRepository importJobRepository, UserRepository userRepository) {
        this.importJobRepository = importJobRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ImportJob processImportFile(MultipartFile file, String category, String importType, String description, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        // Create a new import job
        ImportJob importJob = new ImportJob(
                file.getOriginalFilename(),
                category,
                importType,
                description,
                "processing",
                user.getId()
        );

        // Save the job to get an ID
        importJob = importJobRepository.save(importJob);

        try {
            // Process the file - count rows for now
            int recordCount = countRecords(file);
            importJob.setRecordCount(recordCount);
            importJob.setStatus("completed");
            importJob.setCompletedAt(LocalDateTime.now());

            // In a real implementation, you would process the file data here
            // This might involve parsing the CSV/Excel and storing data in appropriate tables

            return importJobRepository.save(importJob);
        } catch (Exception e) {
            logger.error("Error processing import file: {}", e.getMessage(), e);
            importJob.setStatus("failed");
            importJob.setCompletedAt(LocalDateTime.now());
            return importJobRepository.save(importJob);
        }
    }

    @Override
    public List<ImportJob> getImportHistory(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        return importJobRepository.findByCreatedByOrderByCreatedAtDesc(user.getId());
    }

    @Override
    public ImportJob getImportJobById(Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        Optional<ImportJob> jobOptional = importJobRepository.findById(id);
        if (jobOptional.isPresent()) {
            ImportJob job = jobOptional.get();

            // Check if the job belongs to the user
            if (job.getCreatedBy().equals(user.getId())) {
                return job;
            }
        }

        return null;
    }

    @Override
    public boolean deleteImportJob(Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);

        Optional<ImportJob> jobOptional = importJobRepository.findById(id);
        if (jobOptional.isPresent()) {
            ImportJob job = jobOptional.get();

            // Check if the job belongs to the user
            if (job.getCreatedBy().equals(user.getId())) {
                importJobRepository.delete(job);
                return true;
            }
        }

        return false;
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private int countRecords(MultipartFile file) throws IOException {
        // Simple method to count records in a CSV file
        // For production, use a CSV parser library instead
        int count = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            // Skip header row
            reader.readLine();

            while (reader.readLine() != null) {
                count++;
            }
        }

        return count;
    }
}