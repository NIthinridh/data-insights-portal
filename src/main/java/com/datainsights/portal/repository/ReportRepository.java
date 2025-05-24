package com.datainsights.portal.repository;

import com.datainsights.portal.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT r FROM Report r WHERE r.createdBy = :userId OR r.isPublic = true")
    List<Report> findByCreatedByOrIsPublicTrue(@Param("userId") Long userId);

    List<Report> findByCreatedBy(Long userId);

    List<Report> findByIsPublicTrue();

    List<Report> findByType(String type);
}