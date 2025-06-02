// src/tests/BudgetManagement.test.js - FULLY FIXED
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import BudgetManagement from '../pages/BudgetManagement';
import { getAllBudgets, createBudget, updateBudget, deleteBudget, getBudgetProgress } from '../services/budgetService';
import { getTransactionsByMonth } from '../services/financialService';
import { getTransactionCategories } from '../services/transactionService';

// Mock services
jest.mock('../services/budgetService');
jest.mock('../services/financialService');
jest.mock('../services/transactionService');

describe('BudgetManagement Component', () => {
  const mockBudgets = [
    {
      id: 1,
      category: 'Housing',
      amount: 1500,
      period: 'monthly',
      startDate: '2023-01-01',
      endDate: null,
      notes: 'Rent and utilities'
    },
    {
      id: 2,
      category: 'Food',
      amount: 600,
      period: 'monthly',
      startDate: '2023-01-01',
      endDate: null,
      notes: 'Groceries and eating out'
    }
  ];
  
  const mockTransactions = [
    { id: 1, date: '2023-07-15', amount: -1200, category: 'Housing' },
    { id: 2, date: '2023-07-10', amount: -400, category: 'Food' }
  ];
  
  const mockCategories = ['Housing', 'Food', 'Transportation'];
  
  const mockProgress = {
    'Housing': 1200,
    'Food': 400
  };
  
  // Fix for "no-render-in-setup" - Don't render in beforeEach
  beforeEach(() => {
    // Setup mocks only
    getAllBudgets.mockResolvedValue(mockBudgets);
    getTransactionsByMonth.mockResolvedValue(mockTransactions);
    getTransactionCategories.mockResolvedValue(mockCategories);
    getBudgetProgress.mockResolvedValue(mockProgress);
    createBudget.mockResolvedValue({ id: 3, category: 'Transportation', amount: 300 });
    updateBudget.mockResolvedValue({ ...mockBudgets[0], amount: 1600 });
    deleteBudget.mockResolvedValue({ message: 'Budget deleted' });
  });
  
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <BudgetManagement />
        </AuthProvider>
      </MemoryRouter>
    );
  };
  
  test('renders budget management heading', () => {
    renderComponent();
    expect(screen.getByText(/Budget Management/i)).toBeInTheDocument();
  });
  
  test('shows loading state initially', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('displays budgets after loading', async () => {
    renderComponent();
    
    // Fix for "prefer-find-by" - use findByText instead of waitFor + getByText
    const housingElement = await screen.findByText('Housing');
    expect(housingElement).toBeInTheDocument();
    
    const foodElement = await screen.findByText('Food');
    expect(foodElement).toBeInTheDocument();
  });
  
  test('opens add budget dialog when button is clicked', async () => {
    renderComponent();
    
    // Fix for "prefer-find-by" - use findByText instead of waitFor + getByText
    const housingElement = await screen.findByText('Housing');
    expect(housingElement).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Add Budget'));
    
    expect(screen.getByText('Add New Budget')).toBeInTheDocument();
  });
  
  test('displays budget progress correctly', async () => {
    renderComponent();
    
    // Fix for "prefer-find-by" - use findByText to wait for content
    const amount1200 = await screen.findByText('$1,200.00');
    expect(amount1200).toBeInTheDocument();
    
    const amount400 = await screen.findByText('$400.00');
    expect(amount400).toBeInTheDocument();
  });
});