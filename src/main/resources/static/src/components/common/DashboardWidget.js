// src/services/goalService.js
import { api } from '../contexts/AuthContext';

export const getAllGoals = async () => {
  try {
    const response = await api.get('/financial/goals');
    return response.data;
  } catch (error) {
    console.error('Get goals error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goals');
  }
};

export const getGoalById = async (id) => {
  try {
    const response = await api.get(`/financial/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goal');
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/financial/goals', goalData);
    return response.data;
  } catch (error) {
    console.error('Create goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create goal');
  }
};

export const updateGoal = async (id, goalData) => {
  try {
    const response = await api.put(`/financial/goals/${id}`, goalData);
    return response.data;
  } catch (error) {
    console.error('Update goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update goal');
  }
};

export const deleteGoal = async (id) => {
  try {
    const response = await api.delete(`/financial/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete goal error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete goal');
  }
};

export const addContribution = async (id, amount) => {
  try {
    const response = await api.post(`/financial/goals/${id}/contributions`, { amount });
    return response.data;
  } catch (error) {
    console.error('Add contribution error:', error);
    throw new Error(error.response?.data?.message || 'Failed to add contribution');
  }
};

export const getGoalProgress = async (id) => {
  try {
    const response = await api.get(`/financial/goals/${id}/progress`);
    return response.data;
  } catch (error) {
    console.error('Goal progress error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch goal progress');
  }
};