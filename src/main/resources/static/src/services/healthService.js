// src/services/healthService.js
import apiClient from './api';

export const getFinancialHealthData = async () => {
  try {
    const response = await apiClient.get('/api/financial/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch financial health data');
  }
};

export const getHealthScoreHistory = async (months = 6) => {
  try {
    const response = await apiClient.get(`/api/financial/health/history?months=${months}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch health score history');
  }
};

export const getHealthCategories = async () => {
  try {
    const response = await apiClient.get('/api/financial/health/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching health categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch health categories');
  }
};

export const updateHealthGoals = async (goals) => {
  try {
    const response = await apiClient.post('/api/financial/health/goals', goals);
    return response.data;
  } catch (error) {
    console.error('Error updating health goals:', error);
    throw new Error(error.response?.data?.message || 'Failed to update financial health goals');
  }
};