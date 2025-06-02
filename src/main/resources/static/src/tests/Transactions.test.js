// src/tests/Transactions.test.js - FULLY FIXED
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Transactions from '../pages/Transactions';
import { getAllTransactions, getTransactionCategories, createTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';

// Mock the transaction service
jest.mock('../services/transactionService');

describe('Transactions Component', () => {
  const mockTransactions = [
    {
      id: 1,
      date: '2023-07-15',
      description: 'Grocery Shopping',
      amount: -120.45,
      category: 'Food',
      isReconciled: false,
      balance: 879.55
    },
    {
      id: 2,
      date: '2023-07-14',
      description: 'Salary Deposit',
      amount: 3000.00,
      category: 'Income',
      isReconciled: true,
      balance: 1000.00
    }
  ];
  
  const mockCategories = [
    'Housing', 'Food', 'Transportation', 'Income', 'Entertainment'
  ];
  
  // Fix: Remove render from beforeEach
  beforeEach(() => {
    // Setup mocks only
    getAllTransactions.mockResolvedValue(mockTransactions);
    getTransactionCategories.mockResolvedValue(mockCategories);
    createTransaction.mockResolvedValue({ id: 3, ...mockTransactions[0], description: 'New Transaction' });
    updateTransaction.mockResolvedValue({ ...mockTransactions[0], description: 'Updated Description' });
    deleteTransaction.mockResolvedValue({ message: 'Transaction deleted' });
  });
  
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Transactions />
        </AuthProvider>
      </MemoryRouter>
    );
  };
  
  test('renders transaction management heading', () => {
    renderComponent();
    expect(screen.getByText(/Transaction Management/i)).toBeInTheDocument();
  });
  
  test('shows loading state initially', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('displays transactions after loading', async () => {
    renderComponent();
    
    // Fix: Use findByText instead of waitFor + getByText
    const groceryElement = await screen.findByText('Grocery Shopping');
    expect(groceryElement).toBeInTheDocument();
    
    const salaryElement = await screen.findByText('Salary Deposit');
    expect(salaryElement).toBeInTheDocument();
  });
  
  test('opens add transaction dialog when button is clicked', async () => {
    renderComponent();
    
    // Fix: Use findByText instead of waitFor + getByText
    const groceryText = await screen.findByText('Grocery Shopping');
    expect(groceryText).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Add Transaction'));
    
    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
  
  test('filters transactions by category', async () => {
    renderComponent();
    
    // Fix: Use findByText instead of waitFor + getByText
    const groceryText = await screen.findByText('Grocery Shopping');
    expect(groceryText).toBeInTheDocument();
    
    // Mock filtered transactions
    getAllTransactions.mockResolvedValue([mockTransactions[0]]);
    
    // Open category dropdown
    fireEvent.mouseDown(screen.getByLabelText('Filter by Category'));
    
    // Click on "Food" filter
    const foodOption = await screen.findByText('Food');
    fireEvent.click(foodOption);
    
    // Fix: Use single assertion in waitFor
    await waitFor(() => {
      expect(getAllTransactions).toHaveBeenCalledWith(expect.objectContaining({ category: 'Food' }));
    });
  });
});