// src/services/financialService.js
import { enhancedFinancialApi } from './api';

// Get dashboard summary data
export const getDashboardSummary = async (timeframe = 'month') => {
  try {
    console.log('📊 Fetching dashboard summary for timeframe:', timeframe);
    const response = await enhancedFinancialApi.getDashboardSummary(timeframe);
    console.log('✅ Dashboard summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching dashboard summary:', error);
    // Return default data structure to prevent errors
    return {
      totalTransactions: 0,
      totalAmount: 0,
      avgTransaction: 0,
      recentImports: 0,
      income: 0,
      expenses: 0,
      balance: 0,
      savingsRate: 0
    };
  }
};

// Get transactions by month
export const getTransactionsByMonth = async (year, month) => {
  try {
    console.log('📈 Fetching transactions for:', year, month);
    const response = await enhancedFinancialApi.getTransactionsByMonth(year, month);
    console.log('✅ Monthly transactions response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching transactions by month:', error);
    return [];
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (timeframe = 'month') => {
  try {
    console.log('🏷️ Fetching category data for timeframe:', timeframe);
    const response = await enhancedFinancialApi.getTransactionsByCategory(timeframe);
    console.log('✅ Category transactions response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching transactions by category:', error);
    return [];
  }
};

// Get recent transactions
export const getRecentTransactions = async (limit = 5) => {
  try {
    console.log('🔄 Fetching recent transactions, limit:', limit);
    const response = await enhancedFinancialApi.getRecentTransactions(limit);
    console.log('✅ Recent transactions response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching recent transactions:', error);
    return [];
  }
};

// Get budgets data
export const getBudgets = async () => {
  try {
    console.log('💰 Fetching budgets data...');
    const response = await enhancedFinancialApi.getAllBudgets();
    console.log('✅ Budgets response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching budgets:', error);
    return [];
  }
};

// Get goals data
export const getGoals = async () => {
  try {
    console.log('🎯 Fetching goals data...');
    const response = await enhancedFinancialApi.getAllGoals();
    console.log('✅ Goals response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    return [];
  }
};

// Get forecast data
export const getForecast = async (months = 6) => {
  try {
    console.log('🔮 Fetching forecast data for months:', months);
    const response = await enhancedFinancialApi.getForecast(months);
    console.log('✅ Forecast response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching forecast data:', error);
    return [];
  }
};

// Additional transaction management functions
export const getAllTransactions = async (filters = {}) => {
  try {
    console.log('📋 Fetching all transactions with filters:', filters);
    const response = await enhancedFinancialApi.getAllTransactions(filters);
    console.log('✅ All transactions response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching all transactions:', error);
    return [];
  }
};

export const createTransaction = async (transactionData) => {
  try {
    console.log('➕ Creating new transaction:', transactionData);
    const response = await enhancedFinancialApi.createTransaction(transactionData);
    console.log('✅ Transaction created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    console.log('✏️ Updating transaction:', id, transactionData);
    const response = await enhancedFinancialApi.updateTransaction(id, transactionData);
    console.log('✅ Transaction updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    console.log('🗑️ Deleting transaction:', id);
    const response = await enhancedFinancialApi.deleteTransaction(id);
    console.log('✅ Transaction deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    throw error;
  }
};

// Budget management functions
export const createBudget = async (budgetData) => {
  try {
    console.log('➕ Creating new budget:', budgetData);
    const response = await enhancedFinancialApi.createBudget(budgetData);
    console.log('✅ Budget created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating budget:', error);
    throw error;
  }
};

export const updateBudget = async (id, budgetData) => {
  try {
    console.log('✏️ Updating budget:', id, budgetData);
    const response = await enhancedFinancialApi.updateBudget(id, budgetData);
    console.log('✅ Budget updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (id) => {
  try {
    console.log('🗑️ Deleting budget:', id);
    const response = await enhancedFinancialApi.deleteBudget(id);
    console.log('✅ Budget deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting budget:', error);
    throw error;
  }
};

// Goal management functions
export const createGoal = async (goalData) => {
  try {
    console.log('➕ Creating new goal:', goalData);
    const response = await enhancedFinancialApi.createGoal(goalData);
    console.log('✅ Goal created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (id, goalData) => {
  try {
    console.log('✏️ Updating goal:', id, goalData);
    const response = await enhancedFinancialApi.updateGoal(id, goalData);
    console.log('✅ Goal updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id) => {
  try {
    console.log('🗑️ Deleting goal:', id);
    const response = await enhancedFinancialApi.deleteGoal(id);
    console.log('✅ Goal deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    throw error;
  }
};

// Health check function
export const checkApiHealth = async () => {
  try {
    console.log('🏥 Checking API health...');
    const response = await enhancedFinancialApi.getDashboardSummary();
    console.log('✅ API health check passed');
    return true;
  } catch (error) {
    console.error('❌ API health check failed:', error);
    return false;
  }
};