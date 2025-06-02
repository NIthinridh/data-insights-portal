// src/services/budgetService.js - FIXED VERSION
import { financialApi } from './api';

// Get all budgets
export const getAllBudgets = async () => {
  try {
    // FIXED: Use direct API call if service method doesn't exist
    const token = localStorage.getItem('token');
    const response = await fetch('/api/financial/budgets', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Budgets fetched successfully:', data);
    
    // Return the data directly (should be an array)
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Get budgets error:', error);
    throw error; // Re-throw error so UI can handle it properly
  }
};

// Get budget by ID
export const getBudgetById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/financial/budgets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Get budget error:', error);
    throw new Error(error.message || 'Failed to fetch budget');
  }
};

// Create a new budget - FIXED
export const createBudget = async (budgetData) => {
  try {
    console.log('🚀 Creating budget with data:', budgetData);
    
    // Ensure we're sending a number for amount
    if (budgetData.amount && typeof budgetData.amount === 'string') {
      budgetData.amount = parseFloat(budgetData.amount);
    }

    const token = localStorage.getItem('token');
    const response = await fetch('/api/financial/budgets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Budget created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Create budget error:', error);
    throw new Error(error.message || 'Failed to create budget');
  }
};

// Update an existing budget - FIXED
export const updateBudget = async (id, budgetData) => {
  try {
    console.log(`🔄 Updating budget ${id} with data:`, budgetData);
    
    // Ensure we're sending a number for amount
    if (budgetData.amount && typeof budgetData.amount === 'string') {
      budgetData.amount = parseFloat(budgetData.amount);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/financial/budgets/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(budgetData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Budget updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Update budget error:', error);
    throw new Error(error.message || 'Failed to update budget');
  }
};

// Delete a budget - FIXED
export const deleteBudget = async (id) => {
  try {
    console.log(`🗑️ Deleting budget with ID: ${id}`);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/financial/budgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // DELETE requests might return empty response
    const data = response.status === 204 ? { success: true } : await response.json();
    console.log('✅ Budget deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Delete budget error:', error);
    throw new Error(error.message || 'Failed to delete budget');
  }
};

// Get budget progress for a specific month and year
export const getBudgetProgress = async (year, month) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/financial/budgets/progress?year=${year}&month=${month}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Budget progress API returned ${response.status}, falling back to empty data`);
      return {}; // Return empty object instead of throwing
    }

    const data = await response.json();
    console.log('✅ Budget progress fetched:', data);
    return data || {};
  } catch (error) {
    console.error('❌ Budget progress error:', error);
    return {}; // Return empty object instead of throwing for better UX
  }
};