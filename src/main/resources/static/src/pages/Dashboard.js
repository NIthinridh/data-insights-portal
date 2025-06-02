import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangeIcon from '@mui/icons-material/DateRange';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { useNavigate } from 'react-router-dom';

// Import the service functions for fetching financial data
import {
  getDashboardSummary,
  getTransactionsByMonth,
  getTransactionsByCategory,
  getRecentTransactions,
  getBudgets,
  getGoals,
  getForecast
} from '../services/financialService';

// Default colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    avgTransaction: 0,
    recentImports: 0,
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0
  });
  const [transactionData, setTransactionData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    handleMenuClose();
    fetchDashboardData(newTimeframe);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchDashboardData = async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard summary data
      const summaryResponse = await getDashboardSummary(selectedTimeframe);
      setSummaryData(summaryResponse);
      
      // Get transaction data for chart
      const transactionsResponse = await getTransactionsByMonth(
        new Date().getFullYear(),
        new Date().getMonth() + 1
      );
      // Ensure transactionsResponse is an array
      setTransactionData(Array.isArray(transactionsResponse) ? transactionsResponse : []);
      
      // Get category data for chart
      const categoryResponse = await getTransactionsByCategory(selectedTimeframe);
      // Ensure categoryResponse is an array
      setCategoryData(Array.isArray(categoryResponse) ? categoryResponse : []);
      
      // Get recent transactions
      const recentResponse = await getRecentTransactions(5);
      // Ensure recentResponse is an array
      setRecentTransactions(Array.isArray(recentResponse) ? recentResponse : []);
      
      // Get budget data from API
      const budgetResponse = await getBudgets();
      if (Array.isArray(budgetResponse)) {
        // Transform budget data into the format needed for the UI
        const formattedBudgetData = budgetResponse.map(budget => {
          // Get a random spent value between 10% and 110% of the budget amount for demo purposes
          const spent = budget.progress || Math.round(budget.amount * (Math.random() * 1.0 + 0.1));
          const remaining = budget.amount - spent;
          const percentage = Math.round((spent / budget.amount) * 100);
          
          return {
            category: budget.category,
            budget: budget.amount,
            spent: spent,
            remaining: remaining,
            percentage: percentage
          };
        });
        setBudgetData(formattedBudgetData);
      } else {
        setBudgetData([]);
      }
      
      // Get goals data from API
      const goalsResponse = await getGoals();
      if (Array.isArray(goalsResponse)) {
        // Transform goals data for the UI
        const formattedGoalsData = goalsResponse.map(goal => {
          const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
          // Calculate days left based on target date
          const today = new Date();
          const targetDate = new Date(goal.targetDate);
          const daysLeft = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
          
          return {
            id: goal.id,
            name: goal.name,
            target: goal.targetAmount,
            current: goal.currentAmount,
            progress: progress,
            daysLeft: daysLeft > 0 ? daysLeft : 0
          };
        });
        setGoalsData(formattedGoalsData);
      } else {
        setGoalsData([]);
      }
      
      // Get forecast data from API
      const forecastResponse = await getForecast();
      if (Array.isArray(forecastResponse)) {
        // Transform forecast data for the chart
        const formattedForecastData = forecastResponse.map((month, index) => {
          // Assuming the first 3 months are actual data and the rest are forecasts
          const isActual = index < 3;
          return {
            month: month.month.split(' ')[0], // Extract just the month abbreviation
            actual: isActual ? month.savings : null,
            forecast: !isActual ? month.savings : null
          };
        });
        setForecastData(formattedForecastData);
      } else {
        setForecastData([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  // Comment out unused function or make it used somewhere
  // eslint-disable-next-line no-unused-vars
  const navigateToImport = () => {
    navigate('/import');
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !transactionData.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Ensure all data is in the proper format for charts
  const safeTransactionData = Array.isArray(transactionData) ? transactionData : [];
  const safeCategoryData = Array.isArray(categoryData) ? categoryData : [];
  const safeRecentTransactions = Array.isArray(recentTransactions) ? recentTransactions : [];
  const safeBudgetData = Array.isArray(budgetData) ? budgetData : [];
  const safeGoalsData = Array.isArray(goalsData) ? goalsData : [];
  const safeForecastData = Array.isArray(forecastData) ? forecastData : [];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="div">
          Financial Dashboard
        </Typography>
        <Box>
          {/* Fix for the Tooltip warning - conditionally render based on loading state */}
          {loading ? (
            <IconButton disabled>
              <CircularProgress size={24} />
            </IconButton>
          ) : (
            <Tooltip title="Refresh data">
              <IconButton onClick={refreshData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Change time period">
            <IconButton onClick={handleMenuClick}>
              <DateRangeIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleTimeframeChange('week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleTimeframeChange('month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleTimeframeChange('year')}>This Year</MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Income
            </Typography>
            <Typography variant="h4" color="success.main">
              ${summaryData.income?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Expenses
            </Typography>
            <Typography variant="h4" color="error.main">
              ${summaryData.expenses?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Current Balance
            </Typography>
            <Typography variant="h4" sx={{ color: (summaryData.balance || 0) >= 0 ? 'success.main' : 'error.main' }}>
              ${Math.abs(summaryData.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Savings Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4">
                {summaryData.savingsRate || 0}%
              </Typography>
              {(summaryData.savingsRate > 0) && (
                <TrendingUpIcon sx={{ ml: 1, color: 'success.main' }} />
              )}
              {(summaryData.savingsRate < 0) && (
                <TrendingDownIcon sx={{ ml: 1, color: 'error.main' }} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Dashboard Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ReceiptIcon />} label="TRANSACTIONS" iconPosition="start" />
          <Tab icon={<AccountBalanceWalletIcon />} label="BUDGETS" iconPosition="start" />
          <Tab icon={<FlagIcon />} label="GOALS" iconPosition="start" />
          <Tab icon={<TrendingUpIcon />} label="FORECASTS" iconPosition="start" />
        </Tabs>

        {/* Transaction Tab Panel */}
        <Box role="tabpanel" hidden={tabValue !== 0} id="tabpanel-transactions">
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Transaction Trends Chart */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardHeader
                    title={`Transaction Trends (${timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'This Year'})`}
                    action={
                      <IconButton aria-label="view more" onClick={() => navigate('/transactions')}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    {safeTransactionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={safeTransactionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="income" 
                            stackId="1" 
                            stroke="#4caf50" 
                            fill="#4caf50" 
                            fillOpacity={0.3} 
                            name="Income" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="expenses" 
                            stackId="2" 
                            stroke="#f44336" 
                            fill="#f44336" 
                            fillOpacity={0.3} 
                            name="Expenses" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body1" color="textSecondary">No transaction data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Chart */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardHeader 
                    title="Spending by Category" 
                    action={
                      <IconButton aria-label="view more" onClick={() => navigate('/analytics')}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    {safeCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={safeCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="category"
                            label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {safeCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body1" color="textSecondary">No category data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Transactions */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Recent Transactions" 
                    action={
                      <Button variant="text" onClick={() => navigate('/transactions')}>
                        View All
                      </Button>
                    }
                  />
                  <CardContent>
                    {safeRecentTransactions.length > 0 ? (
                      <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Date</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Description</th>
                              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Category</th>
                              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safeRecentTransactions.map((tx) => (
                              <tr key={tx.id}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{tx.date}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{tx.description}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{tx.category}</td>
                                <td style={{
                                  padding: '8px',
                                  borderBottom: '1px solid #ddd',
                                  textAlign: 'right',
                                  color: tx.amount < 0 ? '#f44336' : '#4caf50',
                                  fontWeight: 'bold'
                                }}>
                                  ${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="textSecondary" align="center">
                        No recent transactions available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Budget Tab Panel */}
        <Box role="tabpanel" hidden={tabValue !== 1} id="tabpanel-budgets">
          {tabValue === 1 && (
            <Grid container spacing={3}>
              {/* Budget Overview */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Monthly Budget Summary" 
                    action={
                      <Button variant="text" onClick={() => navigate('/budgets')}>
                        Manage Budgets
                      </Button>
                    }
                  />
                  <CardContent>
                    {safeBudgetData.length > 0 ? (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body1" gutterBottom>
                            Overall Budget Progress
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              {/* Calculate overall progress as average of category percentages */}
                              {(() => {
                                const overallPercentage = safeBudgetData.reduce(
                                  (sum, budget) => sum + budget.percentage, 
                                  0
                                ) / safeBudgetData.length;
                                
                                return (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={overallPercentage} 
                                    sx={{ 
                                      height: 10, 
                                      borderRadius: 5,
                                      backgroundColor: 'rgba(0,0,0,0.1)',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: overallPercentage > 80 ? 'error.main' : 'success.main'
                                      }
                                    }}
                                  />
                                );
                              })()}
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="textSecondary">
                                {Math.round(
                                  safeBudgetData.reduce(
                                    (sum, budget) => sum + budget.percentage, 
                                    0
                                  ) / safeBudgetData.length
                                )}%
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" gutterBottom>
                          Budget by Category
                        </Typography>
                        {safeBudgetData.map((budget) => (
                          <Box key={budget.category} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{budget.category}</Typography>
                              <Typography variant="body2">
                                ${budget.spent} / ${budget.budget} 
                                <Typography variant="caption" sx={{ ml: 1, color: budget.percentage > 80 ? 'error.main' : 'inherit' }}>
                                  ({budget.percentage}%)
                                </Typography>
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={budget.percentage} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: budget.percentage > 80 ? 'error.main' : 'primary.main'
                                }
                              }}
                            />
                          </Box>
                        ))}
                      </>
                    ) : (
                      <Typography variant="body1" color="textSecondary" align="center">
                        No budget data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Category Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Budget vs Actual" 
                  />
                  <CardContent>
                    {safeBudgetData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={safeBudgetData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="category" type="category" />
                          <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                          <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                          <Bar dataKey="spent" name="Spent" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body1" color="textSecondary">No budget data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Goals Tab Panel */}
        <Box role="tabpanel" hidden={tabValue !== 2} id="tabpanel-goals">
          {tabValue === 2 && (
            <Grid container spacing={3}>
              {/* Goals Summary */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Financial Goals Progress" 
                    action={
                      <Button variant="text" onClick={() => navigate('/goals')}>
                        Manage Goals
                      </Button>
                    }
                  />
                  <CardContent>
                    {safeGoalsData.length > 0 ? (
                      <Grid container spacing={3}>
                        {safeGoalsData.map((goal) => (
                          <Grid item xs={12} md={4} key={goal.id}>
                            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="h6" gutterBottom>
                                {goal.name}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                  ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {goal.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={goal.progress} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  mb: 2,
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'primary.main'
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  onClick={() => navigate('/goals')}
                                >
                                  View Details
                                </Button>
                                <Typography variant="caption" color="textSecondary">
                                  {goal.daysLeft} days left
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body1" color="textSecondary" align="center">
                        No goals data available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Forecast Tab Panel */}
        <Box role="tabpanel" hidden={tabValue !== 3} id="tabpanel-forecasts">
          {tabValue === 3 && (
            <Grid container spacing={3}>
              {/* Forecast Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Financial Forecast" 
                    action={
                      <Button variant="text" onClick={() => navigate('/forecasting')}>
                        View Detailed Forecast
                      </Button>
                    }
                  />
                  <CardContent>
                    {safeForecastData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={safeForecastData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#8884d8" 
                            name="Historical" 
                            strokeWidth={2}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#82ca9d" 
                            name="Forecast" 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <Typography variant="body1" color="textSecondary">No forecast data available</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;