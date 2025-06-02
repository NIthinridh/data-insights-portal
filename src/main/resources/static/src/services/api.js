// src/services/api.js
import axios from 'axios';

// Determine the base URL based on environment
const getBaseURL = () => {
  // In production (Railway), use the production URL
  if (window.location.hostname.includes('railway.app')) {
    return 'https://data-insights-portal-production.up.railway.app';
  }
  
  // In development or if Railway URL is accessed, use relative path for same-origin requests
  if (window.location.hostname === 'data-insights-portal-production.up.railway.app') {
    return ''; // Use relative URLs when already on Railway
  }
  
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8080';
  }
  
  // Default to Railway production
  return 'https://data-insights-portal-production.up.railway.app';
};

// Create axios instance with default configs
const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 30000 // 30 second timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  config => {
    // Make sure URL doesn't have duplicate '/api/api/'
    if (config.url && config.url.startsWith('/api/api/')) {
      console.warn('Duplicate API path detected, fixing:', config.url);
      config.url = config.url.replace('/api/api/', '/api/');
    }
    
    // Log the full URL for debugging
    console.log(`Sending request to: ${config.baseURL}${config.url}`);
    
    // Get token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      // Make sure to include Bearer prefix
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`Token attached to request (first 15 chars): ${token.substring(0, 15)}...`);
    } else {
      console.log('No token found for request');
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`❌ API Error: ${error.response.status} for ${error.config?.url}`, error.response.data);
      
      // Handle token expiration or authentication issues
      if (error.response.status === 401) {
        console.log('🔒 Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        // Don't redirect immediately, let components handle it
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('🌐 No response received:', error.request);
    } else {
      console.error('⚠️ Error setting up request:', error.message);
    }
    
    // Pass the error to the component
    return Promise.reject(error);
  }
);

// Reports API helper functions
const reportsApi = {
  // Get all reports
  getAllReports: () => apiClient.get('/api/reports'),
  
  // Get reports by type
  getReportsByType: (type) => apiClient.get(`/api/reports?type=${type}`),
  
  // Get a single report by ID
  getReportById: (id) => apiClient.get(`/api/reports/${id}`),
  
  // Create a new report
  createReport: (reportData) => apiClient.post('/api/reports', reportData),
  
  // Update an existing report
  updateReport: (id, reportData) => apiClient.put(`/api/reports/${id}`, reportData),
  
  // Delete a report
  deleteReport: (id) => apiClient.delete(`/api/reports/${id}`),
  
  // Generate report data
  generateReportData: (id, parameters = {}) => apiClient.post(`/api/reports/${id}/generate`, parameters),
  
  // Export report in specified format
  exportReport: (id, format = 'pdf', parameters = {}) => {
    const queryParams = new URLSearchParams({ format, ...parameters }).toString();
    return apiClient.get(`/api/reports/${id}/export?${queryParams}`, { responseType: 'blob' });
  }
};

// Authentication API helper functions
const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
  getCurrentUser: () => apiClient.get('/api/auth/me')
};

// Financial API helper functions
const financialApi = {
  // Dashboard API functions - Updated endpoints to match your Spring Boot controllers
  getDashboardSummary: (timeframe = 'month') => apiClient.get(`/api/financial/dashboard-summary?timeframe=${timeframe}`),
  getTransactionsByMonth: (year, month) => apiClient.get(`/api/financial/transactions/monthly-summary?year=${year}&month=${month}`),
  getTransactionsByCategory: (timeframe = 'month') => apiClient.get(`/api/financial/transactions/categories-summary?timeframe=${timeframe}`),
  getRecentTransactions: (limit = 5) => apiClient.get(`/api/financial/transactions/recent-summary?limit=${limit}`),
  
  // Transaction API functions
  getAllTransactions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/api/financial/tx/transactions${queryString ? '?' + queryString : ''}`);
  },
  getTransactionById: (id) => apiClient.get(`/api/financial/tx/transaction/${id}`),
  createTransaction: (transactionData) => apiClient.post('/api/financial/tx/transaction', transactionData),
  updateTransaction: (id, transactionData) => apiClient.put(`/api/financial/tx/transaction/${id}`, transactionData),
  deleteTransaction: (id) => apiClient.delete(`/api/financial/tx/transaction/${id}`),
  getTransactionCategories: () => apiClient.get('/api/financial/tx/categories'),
  
  // Health API functions
  getFinancialHealth: () => apiClient.get('/api/financial/health'),
  getHealthHistory: (months = 6) => apiClient.get(`/api/financial/health/history?months=${months}`),
  getHealthCategories: () => apiClient.get('/api/financial/health/categories'),
  updateHealthGoals: (goals) => apiClient.post('/api/financial/health/goals', goals),
  
  // Forecast API functions
  getForecast: (months = 6) => apiClient.get(`/api/financial/forecast?months=${months}`),
  getIncomeProjection: (months = 6) => apiClient.get(`/api/financial/forecast/income?months=${months}`),
  getExpenseProjection: (months = 6) => apiClient.get(`/api/financial/forecast/expenses?months=${months}`),
  getSavingsProjection: (months = 6) => apiClient.get(`/api/financial/forecast/savings?months=${months}`),
  getCustomForecast: (startDate, endDate) => apiClient.get(`/api/financial/forecast/custom?startDate=${startDate}&endDate=${endDate}`),
  
  // Goals API functions
  getAllGoals: () => apiClient.get('/api/financial/goals'),
  getGoalById: (id) => apiClient.get(`/api/financial/goals/${id}`),
  createGoal: (goalData) => apiClient.post('/api/financial/goals', goalData),
  updateGoal: (id, goalData) => apiClient.put(`/api/financial/goals/${id}`, goalData),
  deleteGoal: (id) => apiClient.delete(`/api/financial/goals/${id}`),
  addContribution: (id, amount) => apiClient.post(`/api/financial/goals/${id}/contributions`, { amount }),
  getGoalProgress: (id) => apiClient.get(`/api/financial/goals/${id}/progress`),
  
  // Budget API functions - Updated to match your BudgetController
  getAllBudgets: () => apiClient.get('/api/financial/budgets'),
  getBudgetById: (id) => apiClient.get(`/api/financial/budgets/${id}`),
  createBudget: (budgetData) => apiClient.post('/api/financial/budgets', budgetData),
  updateBudget: (id, budgetData) => apiClient.put(`/api/financial/budgets/${id}`, budgetData),
  deleteBudget: (id) => apiClient.delete(`/api/financial/budgets/${id}`),
  getBudgetProgress: (year, month) => apiClient.get(`/api/financial/budgets/progress?year=${year}&month=${month}`)
};

// Import API helper functions
const importApi = {
  uploadFile: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add options as form fields
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });
    
    return apiClient.post('/api/data/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getImportJobs: () => apiClient.get('/api/data/imports'),
  getImportJobDetails: (id) => apiClient.get(`/api/data/imports/${id}`),
  deleteImportJob: (id) => apiClient.delete(`/api/data/imports/${id}`)
};

// Health check API helper functions
const healthApi = {
  checkBackend: () => apiClient.get('/api/health'),
  checkDatabase: () => apiClient.get('/api/health/database')
};

// Demo data fallback functions for when API calls fail
const demoData = {
  getDashboardSummary: () => ({
    totalTransactions: 12,
    totalAmount: 2450.75,
    avgTransaction: 204.23,
    recentImports: 2,
    income: 5000.00,
    expenses: 2549.25,
    balance: 2450.75,
    savingsRate: 49.0
  }),
  
  getMonthlyData: () => [
    { period: 'Week 1', amount: 300, income: 1250, expenses: 950 },
    { period: 'Week 2', amount: 600, income: 1250, expenses: 650 },
    { period: 'Week 3', amount: 900, income: 1250, expenses: 350 },
    { period: 'Week 4', amount: 1200, income: 1250, expenses: 50 }
  ],
  
  getCategoryData: () => [
    { category: 'Food', amount: 892.50, percentage: 35 },
    { category: 'Transportation', amount: 637.32, percentage: 25 },
    { category: 'Entertainment', amount: 382.40, percentage: 15 },
    { category: 'Utilities', amount: 382.40, percentage: 15 },
    { category: 'Shopping', amount: 254.63, percentage: 10 }
  ],
  
  getRecentTransactions: () => [
    { id: 1, date: '2025-05-23', description: 'Grocery Store', category: 'Food', amount: -89.50 },
    { id: 2, date: '2025-05-22', description: 'Salary Deposit', category: 'Income', amount: 2500.00 },
    { id: 3, date: '2025-05-21', description: 'Gas Station', category: 'Transportation', amount: -45.20 },
    { id: 4, date: '2025-05-20', description: 'Netflix Subscription', category: 'Entertainment', amount: -15.99 },
    { id: 5, date: '2025-05-19', description: 'Coffee Shop', category: 'Food', amount: -5.75 }
  ],
  
  getBudgets: () => [
    { id: 1, category: 'Food', amount: 1000, progress: 45, period: 'monthly' },
    { id: 2, category: 'Transportation', amount: 500, progress: 80, period: 'monthly' },
    { id: 3, category: 'Entertainment', amount: 300, progress: 25, period: 'monthly' }
  ],
  
  getGoals: () => [
    { id: 1, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, targetDate: '2025-12-31' },
    { id: 2, name: 'Vacation Savings', targetAmount: 3000, currentAmount: 1200, targetDate: '2025-08-15' },
    { id: 3, name: 'New Car', targetAmount: 15000, currentAmount: 3500, targetDate: '2026-06-30' }
  ],
  
  getForecast: () => [
    { month: 'Jan 2025', savings: 800, isActual: true },
    { month: 'Feb 2025', savings: 950, isActual: true },
    { month: 'Mar 2025', savings: 750, isActual: true },
    { month: 'Apr 2025', savings: 1100, isActual: false },
    { month: 'May 2025', savings: 1250, isActual: false },
    { month: 'Jun 2025', savings: 1300, isActual: false }
  ]
};

// Enhanced API wrapper with fallback to demo data
const enhancedFinancialApi = {
  ...financialApi,
  
  // Override methods to include demo data fallback
  getDashboardSummary: async (timeframe = 'month') => {
    try {
      const response = await financialApi.getDashboardSummary(timeframe);
      return response;
    } catch (error) {
      console.warn('⚠️ Dashboard summary API failed, using demo data:', error.message);
      return { data: demoData.getDashboardSummary() };
    }
  },
  
  getTransactionsByMonth: async (year, month) => {
    try {
      const response = await financialApi.getTransactionsByMonth(year, month);
      return response;
    } catch (error) {
      console.warn('⚠️ Monthly transactions API failed, using demo data:', error.message);
      return { data: demoData.getMonthlyData() };
    }
  },
  
  getTransactionsByCategory: async (timeframe = 'month') => {
    try {
      const response = await financialApi.getTransactionsByCategory(timeframe);
      return response;
    } catch (error) {
      console.warn('⚠️ Category transactions API failed, using demo data:', error.message);
      return { data: demoData.getCategoryData() };
    }
  },
  
  getRecentTransactions: async (limit = 5) => {
    try {
      const response = await financialApi.getRecentTransactions(limit);
      return response;
    } catch (error) {
      console.warn('⚠️ Recent transactions API failed, using demo data:', error.message);
      return { data: demoData.getRecentTransactions() };
    }
  },
  
  getAllBudgets: async () => {
    try {
      const response = await financialApi.getAllBudgets();
      return response;
    } catch (error) {
      console.warn('⚠️ Budgets API failed, using demo data:', error.message);
      return { data: demoData.getBudgets() };
    }
  },
  
  getAllGoals: async () => {
    try {
      const response = await financialApi.getAllGoals();
      return response;
    } catch (error) {
      console.warn('⚠️ Goals API failed, using demo data:', error.message);
      return { data: demoData.getGoals() };
    }
  },
  
  getForecast: async (months = 6) => {
    try {
      const response = await financialApi.getForecast(months);
      return response;
    } catch (error) {
      console.warn('⚠️ Forecast API failed, using demo data:', error.message);
      return { data: demoData.getForecast() };
    }
  }
};

// Export the apiClient and API helper functions
export { 
  apiClient as default, 
  reportsApi, 
  authApi, 
  financialApi, 
  enhancedFinancialApi,
  importApi, 
  healthApi,
  demoData
};