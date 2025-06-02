import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from 'date-fns';

// FIXED: Import from the correct service files
import { 
  getBudgets,  // ← Changed from getAllBudgets
  getTransactionsByMonth, 
  createBudget, 
  updateBudget, 
  deleteBudget 
} from '../services/financialService';

// Category service import
import { getTransactionCategories, formatCategoryString } from '../services/categoryService';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetData, setBudgetData] = useState({
    category: '',
    amount: '',
    period: 'Monthly',
    startDate: new Date(),
    endDate: null,
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlySpending, setMonthlySpending] = useState({});
  
  // Calculate spending for the current month
  const calculateMonthlySpending = useCallback((transactionsData = [], budgetsData = []) => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const categorySpending = {};
    
    // Initialize with zeros for all budget categories
    if (Array.isArray(budgetsData)) {
      budgetsData.forEach(budget => {
        if (budget && budget.category) {
          categorySpending[budget.category] = 0;
        }
      });
    }
    
    // Calculate spending from transactions
    if (Array.isArray(transactionsData)) {
      transactionsData.forEach(transaction => {
        if (!transaction || !transaction.date || !transaction.category) return;
        
        const transactionDate = new Date(transaction.date);
        if (
          isWithinInterval(transactionDate, { start, end }) && 
          transaction.amount < 0 && 
          transaction.category in categorySpending
        ) {
          categorySpending[transaction.category] += Math.abs(transaction.amount);
        }
      });
    }
    
    return categorySpending;
  }, [currentMonth]);
  
  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getTransactionCategories();
      console.log('✅ Fetched categories:', data);
      
      let formattedCategories = [];
      
      if (Array.isArray(data)) {
        formattedCategories = data;
      } else if (data && typeof data === 'object') {
        if (data.income && Array.isArray(data.income) && data.expense && Array.isArray(data.expense)) {
          formattedCategories = [...data.income, ...data.expense];
        } else {
          formattedCategories = Object.values(data).flat().filter(Boolean);
        }
      } else {
        formattedCategories = [
          'Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities',
          'Healthcare', 'Education', 'Shopping', 'Personal'
        ];
      }
      
      setCategories(formattedCategories);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setCategories([
        'Food', 'Transportation', 'Entertainment', 'Utilities', 
        'Healthcare', 'Shopping', 'Housing', 'Education', 'Personal'
      ]);
    }
  }, []);
  
  // FIXED: Fetch budgets using correct function name
  const fetchBudgets = useCallback(async () => {
    try {
      console.log("💰 Fetching budgets...");
      const data = await getBudgets(); // ← Changed from getAllBudgets
      console.log("✅ Budget data received:", data);
      
      if (Array.isArray(data)) {
        setBudgets(data);
        return data;
      } else {
        console.warn('Budget data is not an array:', data);
        setBudgets([]);
        return [];
      }
    } catch (err) {
      console.error('❌ Error fetching budgets:', err);
      setError(`Failed to load budget data: ${err.message}`);
      setBudgets([]);
      return [];
    }
  }, []);
  
  // Fetch transactions for current month
  const fetchTransactions = useCallback(async () => {
    try {
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth) + 1;
      
      console.log(`📈 Fetching transactions for ${year}-${month}...`);
      const data = await getTransactionsByMonth(year, month);
      
      if (Array.isArray(data)) {
        setTransactions(data);
        return data;
      } else if (data && typeof data === 'object') {
        const transactionsArray = data.data || data.transactions || [];
        if (Array.isArray(transactionsArray)) {
          setTransactions(transactionsArray);
          return transactionsArray;
        }
      }
      
      setTransactions([]);
      return [];
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      setTransactions([]);
      return [];
    }
  }, [currentMonth]);
  
  // Main data loading effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('📊 Loading all budget management data...');
        
        // Load data in parallel
        const [budgetData, transactionData] = await Promise.all([
          fetchBudgets(),
          fetchTransactions(),
          fetchCategories()  // Load categories
        ]);
        
        // Calculate spending if we have data
        if (budgetData.length > 0 && transactionData.length > 0) {
          const calculatedSpending = calculateMonthlySpending(transactionData, budgetData);
          setMonthlySpending(calculatedSpending);
        }
        
        console.log('✅ All data loaded successfully');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentMonth, fetchBudgets, fetchTransactions, fetchCategories, calculateMonthlySpending]);
  
  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setCurrentBudget(budget);
      setBudgetData({
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period || 'Monthly',
        startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
        endDate: budget.endDate ? new Date(budget.endDate) : null,
        notes: budget.notes || ''
      });
    } else {
      setCurrentBudget(null);
      setBudgetData({
        category: '',
        amount: '',
        period: 'Monthly',
        startDate: new Date(),
        endDate: null,
        notes: ''
      });
    }
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBudget(null);
    setError('');
    setSuccess('');
  };
  
  const handleBudgetChange = (event) => {
    const { name, value } = event.target;
    setBudgetData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError('');
    }
  };
  
  const handleDateChange = (date, field) => {
    setBudgetData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  const validateForm = () => {
    if (!budgetData.category) {
      setError('Category is required');
      return false;
    }
    
    if (!budgetData.amount || isNaN(parseFloat(budgetData.amount)) || parseFloat(budgetData.amount) <= 0) {
      setError('Valid amount is required');
      return false;
    }
    
    if (!budgetData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (budgetData.endDate && new Date(budgetData.endDate) < new Date(budgetData.startDate)) {
      setError('End date must be after start date');
      return false;
    }
    
    return true;
  };
  
  const handleSaveBudget = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const amount = parseFloat(budgetData.amount);
      
      const apiBudgetData = {
        category: budgetData.category,
        amount: amount,
        period: budgetData.period,
        startDate: format(new Date(budgetData.startDate), 'yyyy-MM-dd'),
        endDate: budgetData.endDate ? format(new Date(budgetData.endDate), 'yyyy-MM-dd') : null,
        notes: budgetData.notes || null
      };
      
      console.log('💾 Sending budget data:', apiBudgetData);
      
      if (currentBudget) {
        await updateBudget(currentBudget.id, apiBudgetData);
        setSuccess('Budget updated successfully!');
      } else {
        await createBudget(apiBudgetData);
        setSuccess('Budget created successfully!');
      }
      
      // Refresh budgets data
      setTimeout(async () => {
        handleCloseDialog();
        await fetchBudgets();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      setError(`Failed to save budget: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      try {
        await deleteBudget(id);
        setSuccess('Budget deleted successfully!');
        await fetchBudgets(); // Refresh data
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
        
      } catch (error) {
        console.error('❌ Error deleting budget:', error);
        setError(`Failed to delete budget: ${error.message}`);
      }
    }
  };
  
  // Calculate totals
  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
  const totalSpending = Object.values(monthlySpending).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
  
  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Budget Management
        </Typography>
        
        {/* Budget Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Total Monthly Budget
              </Typography>
              <Typography variant="h4">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Month-to-Date Spending
              </Typography>
              <Typography variant="h4" sx={{ color: totalSpending > totalBudget ? 'error.main' : 'success.main' }}>
                ${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Remaining Budget
              </Typography>
              <Typography variant="h4" sx={{ color: (totalBudget - totalSpending) >= 0 ? 'success.main' : 'error.main' }}>
                ${(totalBudget - totalSpending).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Budget
            </Button>
            
            <DatePicker
              views={['month', 'year']}
              label="View Month"
              value={currentMonth}
              onChange={handleMonthChange}
              slotProps={{ textField: { size: "small", helperText: null } }}
            />
          </Box>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}
        
        {/* Budget Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Budget Progress for {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              
              {budgets.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No budgets found. Click "Add Budget" to create your first budget.
                  </Typography>
                </Paper>
              ) : (
                <Paper>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Budget</TableCell>
                          <TableCell align="right">Spent</TableCell>
                          <TableCell align="right">Remaining</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {budgets.map((budget) => {
                          const spent = monthlySpending[budget.category] || 0;
                          const remaining = budget.amount - spent;
                          const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
                          
                          return (
                            <TableRow key={budget.id}>
                              <TableCell>
                                <Chip label={budget.category} size="small" />
                              </TableCell>
                              <TableCell align="right">
                                ${parseFloat(budget.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell align="right">
                                ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell align="right" sx={{ color: remaining >= 0 ? 'success.main' : 'error.main' }}>
                                ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box sx={{ width: '100%', mr: 1 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={percentage} 
                                      sx={{ 
                                        height: 10, 
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: percentage > 90 ? 'error.main' : percentage > 75 ? 'warning.main' : 'success.main'
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ minWidth: 35 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      {percentage}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleOpenDialog(budget)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleDeleteBudget(budget.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Grid>
            
            {/* Summary Card */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Budget Summary
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary">
                    Top Spending Categories
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(monthlySpending)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([category, amount], index) => {
                        const budget = budgets.find(b => b.category === category);
                        const budgetAmount = budget ? parseFloat(budget.amount) : amount;
                        const percentage = Math.min(Math.round((amount / budgetAmount) * 100), 100);
                        
                        return (
                          <Box key={category} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{category}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: index === 0 ? 'error.main' : index === 1 ? 'warning.main' : 'info.main'
                                }
                              }}
                            />
                          </Box>
                        );
                      })
                    }
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" color="textSecondary">
                    Budget Health
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="body1">
                      {totalSpending <= totalBudget * 0.8 ? (
                        <>
                          <TrendingDownIcon sx={{ color: 'success.main', verticalAlign: 'middle', mr: 1 }} />
                          Under Budget
                        </>
                      ) : totalSpending <= totalBudget ? (
                        <>
                          <TrendingUpIcon sx={{ color: 'warning.main', verticalAlign: 'middle', mr: 1 }} />
                          Approaching Limit
                        </>
                      ) : (
                        <>
                          <TrendingUpIcon sx={{ color: 'error.main', verticalAlign: 'middle', mr: 1 }} />
                          Over Budget
                        </>
                      )}
                    </Typography>
                    <Chip 
                      label={`${Math.round((totalSpending / totalBudget) * 100) || 0}%`} 
                      color={
                        totalSpending <= totalBudget * 0.8 ? 'success' : 
                        totalSpending <= totalBudget ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Budget Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentBudget ? 'Edit Budget' : 'Add New Budget'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
            )}
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!error && error.includes('Category')}>
                  <InputLabel id="category-label">Category *</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={budgetData.category}
                    label="Category *"
                    onChange={handleBudgetChange}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget Amount"
                  name="amount"
                  value={budgetData.amount}
                  onChange={handleBudgetChange}
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!error && error.includes('amount')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="period-label">Budget Period</InputLabel>
                  <Select
                    labelId="period-label"
                    name="period"
                    value={budgetData.period}
                    label="Budget Period"
                    onChange={handleBudgetChange}
                  >
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date *"
                  value={budgetData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date (Optional)"
                  value={budgetData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={budgetData.notes}
                  onChange={handleBudgetChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog} 
              startIcon={<CancelIcon />}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveBudget} 
              variant="contained" 
              color="primary" 
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default BudgetManagement;