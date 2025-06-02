// src/services/goalService.js
import { financialApi } from './api';

export const getAllGoals = async () => {
  try {
    const response = await financialApi.getAllGoals();
    return response.data;
  } catch (error) {
    console.error('Get goals error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goals');
  }
};

export const getGoalById = async (id) => {
  try {
    const response = await financialApi.getGoalById(id);
    return response.data;
  } catch (error) {
    console.error('Get goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goal');
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await financialApi.createGoal(goalData);
    return response.data;
  } catch (error) {
    console.error('Create goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create goal');
  }
};

export const updateGoal = async (id, goalData) => {
  try {
    const response = await financialApi.updateGoal(id, goalData);
    return response.data;
  } catch (error) {
    console.error('Update goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update goal');
  }
};

export const deleteGoal = async (id) => {
  try {
    const response = await financialApi.deleteGoal(id);
    return response.data;
  } catch (error) {
    console.error('Delete goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete goal');
  }
};

export const addContribution = async (id, amount) => {
  try {
    const response = await financialApi.addContribution(id, amount);
    return response.data;
  } catch (error) {
    console.error('Add contribution error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add contribution');
  }
};

export const getGoalProgress = async (id) => {
  try {
    const response = await financialApi.getGoalProgress(id);
    return response.data;
  } catch (error) {
    console.error('Goal progress error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goal progress');
  }
};