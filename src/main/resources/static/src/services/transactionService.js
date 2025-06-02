// src/services/transactionService.js
import apiClient from './api';

// Get all transactions with optional filter parameters
export const getAllTransactions = async (filters = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.type) queryParams.append('type', filters.type);
    
    // Construct URL with query parameters if any exist
    const url = `/api/financial/tx/transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    console.log('Fetching transactions from:', url);
    const response = await apiClient.get(url);
    
    // Log response for debugging
    console.log('Transaction response:', response.data);
    
    // Transform the response data to ensure consistency with frontend expectations
    const transformedData = Array.isArray(response.data) 
      ? response.data.map(tx => ({
          id: tx.id,
          date: tx.date,
          description: tx.description,
          category: tx.category || 'Uncategorized',
          amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount),
          type: tx.type || (tx.amount > 0 ? 'income' : 'expense'),
          account: tx.account || 'Default Account',
          isReconciled: tx.isReconciled === true,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt
        }))
      : [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  try {
    const response = await apiClient.get(`/api/financial/tx/transaction/${id}`);
    
    // Transform the response to ensure consistency
    const tx = response.data;
    return {
      id: tx.id,
      date: tx.date,
      description: tx.description,
      category: tx.category || 'Uncategorized',
      amount: typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount),
      type: tx.type || (tx.amount > 0 ? 'income' : 'expense'),
      account: tx.account || 'Default Account',
      isReconciled: tx.isReconciled === true,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    };
  } catch (error) {
    console.error(`Error fetching transaction with ID ${id}:`, error);
    throw new Error('Failed to fetch transaction details');
  }
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  try {
    console.log('Creating transaction with data:', transactionData);
    const response = await apiClient.post('/api/financial/tx/transaction', transactionData);
    console.log('Create transaction response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

// Update an existing transaction
export const updateTransaction = async (id, transactionData) => {
  try {
    console.log(`Updating transaction ${id} with data:`, transactionData);
    const response = await apiClient.put(`/api/financial/tx/transaction/${id}`, transactionData);
    console.log('Update transaction response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating transaction with ID ${id}:`, error);
    throw new Error('Failed to update transaction');
  }
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    console.log(`Deleting transaction with ID: ${id}`);
    const response = await apiClient.delete(`/api/financial/tx/transaction/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting transaction with ID ${id}:`, error);
    
    // If DELETE fails, try the GET delete endpoint as a fallback
    try {
      console.log(`Trying alternative delete endpoint for ID: ${id}`);
      const altResponse = await apiClient.get(`/api/financial/tx/transaction/delete/${id}`);
      return altResponse.data;
    } catch (altError) {
      console.error(`Alternative delete also failed for ID ${id}:`, altError);
      throw new Error('Failed to delete transaction');
    }
  }
};

// Get transaction categories
export const getTransactionCategories = async () => {
  try {
    const response = await apiClient.get('/api/financial/tx/categories');
    console.log('Categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction categories:', error);
    throw new Error('Failed to fetch transaction categories');
  }
};