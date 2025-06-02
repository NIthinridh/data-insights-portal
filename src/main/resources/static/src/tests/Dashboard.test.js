// src/tests/Dashboard.test.js - FIXED
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';
import { getDashboardSummary, getTransactionsByMonth, getTransactionsByCategory, getRecentTransactions } from '../services/financialService';

// Mock the service functions
jest.mock('../services/financialService');

describe('Dashboard Component', () => {
  // Sample mock data that matches what the component expects
  const mockSummaryData = {
    totalTransactions: 1243,
    totalAmount: 157892.45,
    avgTransaction: 127.02,
    recentImports: 5,
    income: 6500,
    expenses: 4200,
    balance: 2300,
    savingsRate: 35
  };
  
  const mockTransactionData = [
    { period: 'Week 1', amount: 4000, income: 5000, expenses: 1000 },
    { period: 'Week 2', amount: 3000, income: 4000, expenses: 1000 },
    { period: 'Week 3', amount: 2000, income: 3000, expenses: 1000 },
    { period: 'Week 4', amount: 2780, income: 4000, expenses: 1220 }
  ];
  
  const mockCategoryData = [
    { category: 'Housing', amount: 1500, percentage: 35 },
    { category: 'Food', amount: 800, percentage: 20 },
    { category: 'Transportation', amount: 400, percentage: 10 }
  ];
  
  const mockRecentTransactions = [
    { id: 1, date: '2023-07-15', description: 'Monthly Rent', amount: -1500, category: 'Housing' },
    { id: 2, date: '2023-07-14', description: 'Grocery Store', amount: -85.97, category: 'Food' }
  ];
  
  // Setup mocks in beforeEach
  beforeEach(() => {
    // Setup mock responses
    getDashboardSummary.mockResolvedValue(mockSummaryData);
    getTransactionsByMonth.mockResolvedValue(mockTransactionData);
    getTransactionsByCategory.mockResolvedValue(mockCategoryData);
    getRecentTransactions.mockResolvedValue(mockRecentTransactions);
  });
  
  // Helper function to render component in each test
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MemoryRouter>
    );
  };
  
  test('renders dashboard heading', () => {
    renderComponent();
    expect(screen.getByText(/Financial Dashboard/i)).toBeInTheDocument();
  });
  
  test('shows loading state initially', () => {
    renderComponent();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('displays financial overview cards after loading', async () => {
    renderComponent();
    
    // Use findByText for elements that need to wait for API data
    const incomeHeading = await screen.findByText('Income');
    expect(incomeHeading).toBeInTheDocument();
    
    const incomeValue = await screen.findByText('$6,500.00');
    expect(incomeValue).toBeInTheDocument();
    
    const expensesHeading = await screen.findByText('Expenses');
    expect(expensesHeading).toBeInTheDocument();
  });
  
  test('displays transaction tabs and content', async () => {
    renderComponent();
    
    // Wait for data to load
    await screen.findByText('Income');
    
    // Check for tabs
    expect(screen.getByText('TRANSACTIONS')).toBeInTheDocument();
    expect(screen.getByText('BUDGETS')).toBeInTheDocument();
    expect(screen.getByText('GOALS')).toBeInTheDocument();
    expect(screen.getByText('FORECASTS')).toBeInTheDocument();
    
    // Check for transaction trends
    const trendsTitle = await screen.findByText(/Transaction Trends/i);
    expect(trendsTitle).toBeInTheDocument();
    
    // Check for recent transactions
    const recentTransactionsTitle = await screen.findByText('Recent Transactions');
    expect(recentTransactionsTitle).toBeInTheDocument();
  });
});