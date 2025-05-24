package com.datainsights.portal.repository.mongo;

import com.datainsights.portal.model.mongo.AnalyticsResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing analytics results in MongoDB
 */
@Repository
public interface AnalyticsResultRepository extends MongoRepository<AnalyticsResult, String> {

    /**
     * Find analytics results by user ID, ordered by creation date (descending)
     */
    List<AnalyticsResult> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    /**
     * Find analytics results by type and user ID
     */
    List<AnalyticsResult> findByTypeAndCreatedBy(String type, Long createdBy);
}
