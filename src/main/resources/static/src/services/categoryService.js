// src/services/categoryService.js
import { financialApi } from './api';

// Get all transaction categories - updated to use financialApi
export const getTransactionCategories = async () => {
  try {
    const response = await financialApi.getTransactionCategories();
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories if API fails
    return [
      'Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities',
      'Healthcare', 'Education', 'Shopping', 'Personal'
    ];
  }
};

// Helper function to format category strings
export const formatCategoryString = (categoryString) => {
  if (!categoryString) return [];
  
  // Handle different input formats
  if (Array.isArray(categoryString)) {
    return categoryString;
  }
  
  if (typeof categoryString === 'string') {
    // Check if it's already a comma-separated list
    if (categoryString.includes(',')) {
      return categoryString.split(',').map(cat => cat.trim());
    }
    
    // Match words that start with capital letters
    // This regex looks for capital letters preceded by word boundaries or other capital letters
    const matches = categoryString.match(/([A-Z][a-z]+)/g);
    if (matches && matches.length > 0) {
      return matches;
    }
    
    // If no matches were found with the regex, fall back to simple splitting
    return categoryString.split(/(?=[A-Z])/).filter(cat => cat.trim());
  }
  
  if (typeof categoryString === 'object') {
    return Object.values(categoryString);
  }
  
  // Default categories if nothing else works
  return [
    'Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities',
    'Healthcare', 'Education', 'Shopping', 'Personal'
  ];
};