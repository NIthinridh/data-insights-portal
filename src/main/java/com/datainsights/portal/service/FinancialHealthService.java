package com.datainsights.portal.service;

import java.util.List;
import java.util.Map;

public interface FinancialHealthService {
    Map<String, Object> getFinancialHealth(String username);
    List<Map<String, Object>> getHealthHistory(String username, int months);
    List<Map<String, Object>> getHealthCategories();
    Map<String, Object> updateHealthGoals(String username, Map<String, Object> goals);
}