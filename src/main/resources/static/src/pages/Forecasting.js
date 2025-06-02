import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// Import forecast service
import { 
  getForecastData, 
  getCustomForecast,
  getIncomeProjection,
  getExpenseProjection,
  getSavingsProjection
} from '../services/forecastService';

// Custom tooltip formatter for currency values
const currencyFormatter = (value) => {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Forecasting = () => {
  const [forecastData, setForecastData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  
  // Additional state for detailed forecasts
  const [savingsProjections, setSavingsProjections] = useState([]);
  
  // Process the forecast data from the API to ensure proper formatting
  const processForecastData = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format received from API');
    }
    
    // Process and format data for charts
    return data.map(item => ({
      ...item,
      // Ensure all required properties exist
      month: item.month || '',
      income: parseFloat(item.income || 0),
      expenses: parseFloat(item.expenses || 0),
      balance: parseFloat(item.income || 0) - parseFloat(item.expenses || 0),
      isForecast: true // Everything from forecast API is forecast data
    }));
  }, []);
  
  // Fetch all forecast data
  const fetchAllForecastData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get main forecast data
      const data = await getForecastData(forecastMonths);
      console.log('Forecast data received:', data);
      
      // Process and set the data
      const processedData = processForecastData(data);
      setForecastData(processedData);
      setCombinedData(processedData);
      
      // Fetch detailed projections
      try {
        const [incomeData, expenseData, savingsData] = await Promise.all([
          getIncomeProjection(forecastMonths),
          getExpenseProjection(forecastMonths),
          getSavingsProjection(forecastMonths)
        ]);
        
        console.log('Detailed projections received:', { 
          income: incomeData, 
          expense: expenseData, 
          savings: savingsData 
        });
        
        // Set the projections if they're valid
        if (Array.isArray(savingsData)) setSavingsProjections(savingsData);
      } catch (projError) {
        console.error('Error fetching detailed projections:', projError);
        setError('Failed to load some projection details. Main forecast is still available.');
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError('Failed to load forecast data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [forecastMonths, processForecastData]);
  
  useEffect(() => {
    // Fetch forecast data whenever forecast months change or refresh is needed
    fetchAllForecastData();
  }, [forecastMonths, refreshData, fetchAllForecastData]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleForecastMonthsChange = (event) => {
    const months = event.target.value;
    setForecastMonths(months);
  };
  
  const handleCustomStartDateChange = (date) => {
    setCustomStartDate(date);
  };
  
  const handleCustomEndDateChange = (date) => {
    setCustomEndDate(date);
  };
  
  const applyCustomDateRange = async () => {
    if (!customStartDate || !customEndDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (customEndDate < customStartDate) {
      setError('End date must be after start date');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Format dates for API
      const startDateStr = format(customStartDate, 'yyyy-MM-dd');
      const endDateStr = format(customEndDate, 'yyyy-MM-dd');
      
      // Get custom forecast from API
      const data = await getCustomForecast(startDateStr, endDateStr);
      console.log('Custom forecast data:', data);
      
      if (data) {
        // If it's an object with summary data (as designed in our controller)
        if (!Array.isArray(data) && typeof data === 'object') {
          // Extract just what we need for the UI
          const customForecast = [{
            month: `${format(customStartDate, 'MMM yyyy')} - ${format(customEndDate, 'MMM yyyy')}`,
            income: data.totalIncome || 0,
            expenses: data.totalExpenses || 0,
            balance: (data.totalIncome || 0) - (data.totalExpenses || 0),
            savingsRate: data.savingsRate || 0,
            netWorthGrowth: data.growthRate || 0,
            finalNetWorth: data.finalNetWorth || 0,
            isForecast: true
          }];
          
          setForecastData(customForecast);
          setCombinedData(customForecast);
        } else if (Array.isArray(data)) {
          // If it's an array, process it normally
          const processedData = processForecastData(data);
          setForecastData(processedData);
          setCombinedData(processedData);
        }
      } else {
        throw new Error('No data received for custom forecast');
      }
    } catch (err) {
      console.error('Error fetching custom forecast:', err);
      setError('Failed to generate custom forecast. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshData(prev => !prev);
  };
  
  // Calculate summary stats
  const calculateSummary = () => {
    // Default zeros when no data
    if (!forecastData.length) return { incomeChange: 0, expenseChange: 0, balanceChange: 0 };
    
    // If only one item in forecast data
    if (forecastData.length === 1) {
      return { 
        incomeChange: 0, 
        expenseChange: 0, 
        balanceChange: 0 
      };
    }
    
    // Otherwise, compare first and last items in forecast data
    const firstForecast = forecastData[0];
    const lastForecast = forecastData[forecastData.length - 1];
    
    const balanceChange = firstForecast.balance !== 0 
      ? ((lastForecast.balance - firstForecast.balance) / Math.abs(firstForecast.balance)) * 100
      : 0;
      
    const incomeChange = firstForecast.income !== 0 
      ? ((lastForecast.income - firstForecast.income) / firstForecast.income) * 100
      : 0;
      
    const expenseChange = firstForecast.expenses !== 0 
      ? ((lastForecast.expenses - firstForecast.expenses) / firstForecast.expenses) * 100
      : 0;
      
    return {
      incomeChange: +incomeChange.toFixed(1),
      expenseChange: +expenseChange.toFixed(1),
      balanceChange: +balanceChange.toFixed(1)
    };
  };
  
  const summary = calculateSummary();
  
  // Prepare data for charts
  const prepareChartData = (data) => {
    // Add color coding for forecast vs historical data
    return data.map(item => ({
      ...item,
      fill: item.isForecast ? '#e3f2fd' : '#fff'
    }));
  };
  
  // Prepare cumulative savings data
  const prepareSavingsData = () => {
    if (!savingsProjections.length) {
      // If we don't have detailed savings projections, calculate from combined data
      let cumulative = 0;
      return combinedData.map(item => {
        const monthlySavings = item.income - item.expenses;
        cumulative += monthlySavings;
        return {
          month: item.month,
          monthlySavings: monthlySavings,
          cumulative: cumulative,
          isForecast: item.isForecast
        };
      });
    }
    
    // Use the detailed savings projections if available
    return savingsProjections.map(item => ({
      ...item,
      monthlySavings: item.monthlySavings || 0,
      interestEarned: item.interestEarned || 0,
      total: item.totalSavings || 0
    }));
  };
  
  const savingsData = prepareSavingsData();
  
  // Get financial recommendations based on forecast
  const getRecommendations = () => {
    const recommendations = [];
    
    if (summary.incomeChange < 0) {
      recommendations.push('Income is projected to decrease. Consider exploring additional income sources.');
    }
    
    if (summary.expenseChange > 5) {
      recommendations.push('Expenses are projected to increase significantly. Review your budget to identify areas for potential savings.');
    }
    
    if (summary.balanceChange < 0) {
      recommendations.push('Your financial balance is projected to decrease. Consider adjusting your spending habits.');
    }
    
    // Add more sophisticated recommendations based on the detailed projections
    if (savingsProjections.length > 0) {
      const lastSavings = savingsProjections[savingsProjections.length - 1];
      if (lastSavings.monthlySavings < 0) {
        recommendations.push('You are projected to have negative savings in the future. Create a stricter budget to avoid depleting your reserves.');
      }
    }
    
    // Default recommendation if none of the above apply
    if (recommendations.length === 0) {
      recommendations.push('Your financial outlook is positive. Continue your current financial habits and consider increasing investments.');
    }
    
    return recommendations;
  };
  
  // If there's no data at all, show a message
  if (!loading && forecastData.length === 0 && !error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No forecast data is available. Please try changing the forecast parameters or refresh the page.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={handleRefresh}
        >
          Refresh Data
        </Button>
      </Box>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Forecasting
        </Typography>
        
        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel id="forecast-months-label">Forecast Months</InputLabel>
                <Select
                  labelId="forecast-months-label"
                  value={forecastMonths}
                  label="Forecast Months"
                  onChange={handleForecastMonthsChange}
                >
                  <MenuItem value={3}>3 months</MenuItem>
                  <MenuItem value={6}>6 months</MenuItem>
                  <MenuItem value={12}>12 months</MenuItem>
                  <MenuItem value={24}>24 months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Custom Start"
                value={customStartDate}
                onChange={handleCustomStartDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Custom End"
                value={customEndDate}
                onChange={handleCustomEndDateChange}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={customStartDate || undefined}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={applyCustomDateRange}
                disabled={!customStartDate || !customEndDate || loading}
              >
                Apply Custom Range
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Projected Income Change
              </Typography>
              <Typography variant="h4" sx={{ color: summary.incomeChange >= 0 ? 'success.main' : 'error.main' }}>
                {summary.incomeChange >= 0 ? '+' : ''}{summary.incomeChange}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Projected Expense Change
              </Typography>
              <Typography variant="h4" sx={{ color: summary.expenseChange <= 0 ? 'success.main' : 'error.main' }}>
                {summary.expenseChange >= 0 ? '+' : ''}{summary.expenseChange}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Projected Balance Change
              </Typography>
              <Typography variant="h4" sx={{ color: summary.balanceChange >= 0 ? 'success.main' : 'error.main' }}>
                {summary.balanceChange >= 0 ? '+' : ''}{summary.balanceChange}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="INCOME & EXPENSES" />
                <Tab label="BALANCE FORECAST" />
                <Tab label="SAVINGS PROJECTIONS" />
              </Tabs>
              
              <Box sx={{ p: 2, height: 400 }}>
                {/* Income & Expenses Chart */}
                {tabValue === 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareChartData(combinedData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => currencyFormatter(value)} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Income" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        fillOpacity={0.3} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        stroke="#f44336" 
                        fill="#f44336" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                
                {/* Balance Forecast Chart */}
                {tabValue === 1 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData(combinedData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => currencyFormatter(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        name="Net Balance" 
                        stroke="#2196f3" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                      <ReferenceLine 
                        y={0} 
                        stroke="#000" 
                        strokeDasharray="3 3" 
                        label="Break Even" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                
                {/* Savings Projections Chart */}
                {tabValue === 2 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => currencyFormatter(value)} />
                      <Legend />
                      <Bar 
                        dataKey="monthlySavings" 
                        name="Monthly Savings" 
                        fill="#4caf50" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulative" 
                        name="Cumulative Savings" 
                        stroke="#1976d2" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Total Savings" 
                        stroke="#9c27b0" 
                        strokeWidth={2} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Paper>
            
            {/* Forecast Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Forecast Analysis
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Monthly Income Trend" 
                          secondary={
                            `${summary.incomeChange >= 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(summary.incomeChange)}% over the forecast period`
                          } 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Monthly Expenses Trend" 
                          secondary={
                            `${summary.expenseChange >= 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(summary.expenseChange)}% over the forecast period`
                          } 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Savings Potential" 
                          secondary={
                            forecastData.length > 0 
                              ? `Approximately ${currencyFormatter(forecastData.reduce((sum, item) => sum + (item.income - item.expenses), 0))} over the forecast period`
                              : 'No forecast data available'
                          } 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Financial Health Indicator" 
                          secondary={
                            summary.balanceChange >= 5 
                              ? 'Improving' 
                              : summary.balanceChange >= 0 
                                ? 'Stable' 
                                : 'Declining'
                          } 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                  <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    <List>
                      {getRecommendations().map((recommendation, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <Divider />}
                          <ListItem>
                            <ListItemText primary={recommendation} />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Forecasting;