package com.datainsights.portal.service;

import com.datainsights.portal.model.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ForecastService {
    List<Map<String, Object>> generateForecast(User user, int months);
    List<Map<String, Object>> generateIncomeProjection(User user, int months);
    List<Map<String, Object>> generateExpenseProjection(User user, int months);
    List<Map<String, Object>> generateSavingsProjection(User user, int months);
    Map<String, Object> generateCustomForecast(User user, LocalDate startDate, LocalDate endDate);
}