// src/services/forecastService.js
import { financialApi } from './api';

export const getForecastData = async (months = 6) => {
  try {
    const response = await financialApi.getForecast(months);
    return response.data;
  } catch (error) {
    console.error('Forecast data error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch forecast data');
  }
};

export const getIncomeProjection = async (months = 6) => {
  try {
    const response = await financialApi.getIncomeProjection(months);
    return response.data;
  } catch (error) {
    console.error('Income projection error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch income projection');
  }
};

export const getExpenseProjection = async (months = 6) => {
  try {
    const response = await financialApi.getExpenseProjection(months);
    return response.data;
  } catch (error) {
    console.error('Expense projection error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch expense projection');
  }
};

export const getSavingsProjection = async (months = 6) => {
  try {
    const response = await financialApi.getSavingsProjection(months);
    return response.data;
  } catch (error) {
    console.error('Savings projection error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch savings projection');
  }
};

export const getCustomForecast = async (startDate, endDate) => {
  try {
    const response = await financialApi.getCustomForecast(startDate, endDate);
    return response.data;
  } catch (error) {
    console.error('Custom forecast error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch custom forecast');
  }
};