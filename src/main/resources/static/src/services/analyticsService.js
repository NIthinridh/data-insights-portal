// src/services/analyticsService.js
import apiClient from './api';

// Helper function to safely parse float numbers
const safeParseFloat = (value) => {
  if (value === undefined || value === null) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to format dates for API
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  
  // Handle potential invalid date objects
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date provided:', date);
    return null;
  }
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Helper to calculate date ranges
const getDateRange = (timeRange) => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(timeRange) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      // Default to last month if invalid range
      startDate.setMonth(endDate.getMonth() - 1);
  }
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// Map API response to chart data
const mapToChartData = (apiData, analysisType) => {
  console.log('Mapping API data to chart format:', apiData);
  
  // Initialize chart data structures
  let pieData = [];
  let barData = [];
  let lineData = [];
  
  // Process summary data directly from the API response
  const totalIncome = safeParseFloat(apiData.summary?.totalIncome);
  const totalExpenses = safeParseFloat(apiData.summary?.totalExpenses);
  const balance = safeParseFloat(apiData.summary?.balance);
  const transactionCount = safeParseFloat(apiData.summary?.transactionCount);
  const savingsRate = safeParseFloat(apiData.summary?.savingsRate);
  
  // Create summary object
  const summary = {
    totalTransactions: transactionCount,
    totalAmount: balance,
    totalIncome: totalIncome,
    totalExpenses: totalExpenses,
    balance: balance,
    savingsRate: savingsRate,
    averageTransaction: transactionCount > 0 ? 
      (Math.abs(totalIncome) + Math.abs(totalExpenses)) / transactionCount : 0,
    largestTransaction: 0, // Initialize with zero, will be determined from trends if available
    smallestTransaction: 0, // Initialize with zero, will be determined from trends if available
    topCategory: 'None'
  };
  
  // Process categories for pie chart
  if (apiData.categories && apiData.categories.categories) {
    const categories = apiData.categories.categories;
    
    // Find the top category
    let topCategoryName = 'None';
    let topCategoryAmount = 0;
    
    Object.entries(categories).forEach(([category, data]) => {
      const amount = safeParseFloat(data.amount);
      if (amount > topCategoryAmount) {
        topCategoryAmount = amount;
        topCategoryName = category;
      }
    });
    
    summary.topCategory = topCategoryName;
    
    // Filter categories based on analysis type
    if (analysisType === 'expenses') {
      // For expenses, use all categories
      pieData = Object.entries(categories).map(([category, data]) => ({
        name: category,
        value: safeParseFloat(data.percentage)
      }));
    } else if (analysisType === 'income') {
      // For income, we should use income categories (not present in the sample data)
      // But we'll create a placeholder for now
      pieData = [{ name: 'Salary', value: 100 }];
    } else if (analysisType === 'comparison') {
      // For comparison, show income vs expenses
      const total = Math.abs(totalIncome) + Math.abs(totalExpenses);
      if (total > 0) {
        pieData = [
          { name: 'Income', value: Math.round((Math.abs(totalIncome) / total) * 100) },
          { name: 'Expenses', value: Math.round((Math.abs(totalExpenses) / total) * 100) }
        ];
      }
    }
    
    // Sort by value descending
    pieData.sort((a, b) => b.value - a.value);
    
    console.log('Generated pie chart data:', pieData);
  }
  
  // Process trends for bar and line charts
  if (apiData.trends && apiData.trends.length > 0) {
    const trends = apiData.trends;
    
    // Find largest and smallest transactions
    let largestTransaction = 0;
    let smallestTransaction = Number.MAX_VALUE;
    
    trends.forEach(trend => {
      const income = safeParseFloat(trend.income);
      const expenses = safeParseFloat(trend.expenses);
      
      if (income > largestTransaction) largestTransaction = income;
      if (expenses > largestTransaction) largestTransaction = expenses;
      
      if (income > 0 && income < smallestTransaction) smallestTransaction = income;
      if (expenses > 0 && expenses < smallestTransaction) smallestTransaction = expenses;
    });
    
    summary.largestTransaction = largestTransaction;
    summary.smallestTransaction = smallestTransaction === Number.MAX_VALUE ? 0 : smallestTransaction;
    
    // Create bar chart data
    if (analysisType === 'comparison') {
      // For comparison, include both income and expenses
      barData = trends.map(trend => ({
        name: trend.interval,
        income: safeParseFloat(trend.income),
        expenses: safeParseFloat(trend.expenses)
      }));
    } else {
      // For other analysis types
      barData = trends.map(trend => {
        let value = 0;
        if (analysisType === 'income') {
          value = safeParseFloat(trend.income);
        } else if (analysisType === 'expenses') {
          value = safeParseFloat(trend.expenses);
        } else {
          // For trends, use balance
          value = safeParseFloat(trend.balance);
        }
        
        return {
          name: trend.interval,
          value: value
        };
      });
    }
    
    console.log('Generated bar chart data:', barData);
    
    // Create line chart data - same as bar data but with date format
    if (analysisType === 'comparison') {
      // For comparison, include both income and expenses
      lineData = trends.map(trend => ({
        date: trend.interval,
        income: safeParseFloat(trend.income),
        expenses: safeParseFloat(trend.expenses)
      }));
    } else {
      // For other analysis types
      lineData = trends.map(trend => {
        let amount = 0;
        if (analysisType === 'income') {
          amount = safeParseFloat(trend.income);
        } else if (analysisType === 'expenses') {
          amount = safeParseFloat(trend.expenses);
        } else {
          // For trends, use balance
          amount = safeParseFloat(trend.balance);
        }
        
        return {
          date: trend.interval,
          amount: amount
        };
      });
    }
    
    console.log('Generated line chart data:', lineData);
  }
  
  // Return the processed data
  return {
    pieData,
    barData,
    lineData,
    summary
  };
};

export const getAnalyticsData = async (analysisType, timeRange, startDate, endDate) => {
  console.log('Analytics request:', { analysisType, timeRange, startDate, endDate });
  
  // Use provided date range or calculate based on timeRange
  const dateRange = timeRange === 'custom' && startDate && endDate
    ? { startDate: formatDate(startDate), endDate: formatDate(endDate) }
    : getDateRange(timeRange);
  
  console.log('Using date range:', dateRange);
  
  // Prepare params for API calls
  const params = {
    analysisType,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  };
  
  // Fetch data from backend
  const apiData = {};
  
  try {
    // Fetch financial summary
    const summaryResponse = await apiClient.get('/api/analytics/summary', { params });
    apiData.summary = summaryResponse.data;
    
    // Fetch category breakdown
    const categoriesResponse = await apiClient.get('/api/analytics/categories', { params });
    apiData.categories = categoriesResponse.data;
    
    // Fetch trends data with appropriate interval
    const interval = timeRange === 'week' ? 'daily' : timeRange === 'month' ? 'weekly' : 'monthly';
    const trendsResponse = await apiClient.get('/api/analytics/trends', { 
      params: { ...params, interval } 
    });
    apiData.trends = trendsResponse.data;
    
    console.log('API responses received:', apiData);
    console.log('SUMMARY RESPONSE:', JSON.stringify(apiData.summary, null, 2));
    console.log('CATEGORIES RESPONSE:', JSON.stringify(apiData.categories, null, 2));
    console.log('TRENDS RESPONSE:', JSON.stringify(apiData.trends, null, 2));
    
    // Map API data to chart format - no fallbacks
    return mapToChartData(apiData, analysisType);
    
  } catch (error) {
    console.error('API error or data processing error:', error);
    // Return empty data structures instead of fallbacks
    return {
      pieData: [],
      barData: [],
      lineData: [],
      summary: {
        totalTransactions: 0,
        totalAmount: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        savingsRate: 0,
        averageTransaction: 0,
        largestTransaction: 0,
        smallestTransaction: 0,
        topCategory: 'None'
      }
    };
  }
};