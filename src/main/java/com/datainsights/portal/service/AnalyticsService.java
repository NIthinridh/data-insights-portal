package com.datainsights.portal.service;

import com.datainsights.portal.model.mongo.AnalyticsResult;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service for performing financial data analysis and generating insights
 */
public interface AnalyticsService {

    /**
     * Generate a financial summary for a specific date range
     *
     * @param startDate Beginning of the analysis period
     * @param endDate End of the analysis period
     * @param authentication Current user's authentication
     * @return Map containing total income, expenses, balance, and savings rate
     */
    Map<String, Object> getFinancialSummary(LocalDate startDate, LocalDate endDate, Authentication authentication);

    /**
     * Analyze spending by category for a specific date range
     *
     * @param startDate Beginning of the analysis period
     * @param endDate End of the analysis period
     * @param authentication Current user's authentication
     * @return Map containing category names and corresponding amounts
     */
    Map<String, Object> getCategoryBreakdown(LocalDate startDate, LocalDate endDate, Authentication authentication);

    /**
     * Generate trend data for financial metrics over time
     *
     * @param startDate Beginning of the analysis period
     * @param endDate End of the analysis period
     * @param interval Time interval for grouping (daily, weekly, monthly)
     * @param authentication Current user's authentication
     * @return List of maps containing date/time intervals and corresponding values
     */
    List<Map<String, Object>> getFinancialTrends(LocalDate startDate, LocalDate endDate, String interval, Authentication authentication);

    /**
     * Save analytics result to MongoDB for future reference
     *
     * @param type Type of analysis (SUMMARY, CATEGORY, TREND)
     * @param parameters Parameters used for the analysis
     * @param results Analysis results
     * @param authentication Current user's authentication
     * @return The saved analytics result
     */
    AnalyticsResult saveAnalyticsResult(String type, Map<String, Object> parameters, Map<String, Object> results, Authentication authentication);

    /**
     * Get history of saved analytics results
     *
     * @param authentication Current user's authentication
     * @return List of previous analytics results
     */
    List<AnalyticsResult> getAnalyticsHistory(Authentication authentication);
}