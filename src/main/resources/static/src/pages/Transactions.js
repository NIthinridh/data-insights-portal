// src/pages/Transactions.js - FIXED
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

// Import transaction service functions
import { 
  getAllTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getTransactionCategories 
} from '../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [transactionData, setTransactionData] = useState({
    date: new Date(),
    description: '',
    category: '',
    amount: '',
    isReconciled: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshData, setRefreshData] = useState(false);
  
  const fetchCategories = async () => {
    try {
      const data = await getTransactionCategories();
      
      // Check the data structure and extract all categories into a flat array
      if (data && typeof data === 'object') {
        // If data has income and expense arrays, flatten them into a single array
        if (Array.isArray(data.income) && Array.isArray(data.expense)) {
          setCategories([...data.income, ...data.expense]);
        } else {
          // If it's another kind of object, try to extract values
          const categoryArray = Object.values(data).flat().filter(Boolean);
          if (categoryArray.length > 0) {
            setCategories(categoryArray);
          } else {
            // Fallback to default if we can't extract categories
            throw new Error('Invalid category structure');
          }
        }
      } else if (Array.isArray(data)) {
        // If it's already an array, use it directly
        setCategories(data);
      } else {
        // Invalid data format
        throw new Error('Invalid category structure');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to default categories if API fails
      setCategories([
        'Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 
        'Healthcare', 'Education', 'Shopping', 'Personal', 'Income', 'Investment'
      ]);
    }
  };

  // Use useCallback to memoize fetchTransactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Set up filter parameters
      const filters = {};
      if (filterCategory) filters.category = filterCategory;
      
      // Add type filter based on tab
      if (tabValue === 1) filters.type = 'income';
      if (tabValue === 2) filters.type = 'expense';
      
      // Call API to get transactions
      const data = await getAllTransactions(filters);
      
      // Sort by date descending and calculate running balance
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      let balance = 0;
      data.forEach(transaction => {
        balance += transaction.amount;
        transaction.balance = +balance.toFixed(2);
      });
      
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
      
      // Fallback to empty array if API fails
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, tabValue]);
  
  useEffect(() => {
    // Fetch categories
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch transactions whenever filter changes or data needs refresh
    fetchTransactions();
  }, [filterCategory, tabValue, refreshData, fetchTransactions]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      // Edit existing transaction
      setCurrentTransaction(transaction);
      setTransactionData({
        date: new Date(transaction.date),
        description: transaction.description,
        category: transaction.category,
        amount: Math.abs(transaction.amount).toString(),
        isReconciled: transaction.isReconciled,
        isIncome: transaction.amount > 0
      });
    } else {
      // New transaction
      setCurrentTransaction(null);
      setTransactionData({
        date: new Date(),
        description: '',
        category: '',
        amount: '',
        isReconciled: false,
        isIncome: false
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTransaction(null);
  };
  
  const handleTransactionChange = (event) => {
    const { name, value, checked } = event.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: name === 'isReconciled' ? checked : value
    }));
  };
  
  const handleDateChange = (date) => {
    setTransactionData(prev => ({
      ...prev,
      date
    }));
  };
  
  const validateForm = () => {
    if (!transactionData.date) {
      setError('Date is required');
      return false;
    }
    
    if (!transactionData.description) {
      setError('Description is required');
      return false;
    }
    
    if (!transactionData.category) {
      setError('Category is required');
      return false;
    }
    
    if (!transactionData.amount || isNaN(parseFloat(transactionData.amount)) || parseFloat(transactionData.amount) <= 0) {
      setError('Valid amount is required');
      return false;
    }
    
    return true;
  };
  
  const handleSaveTransaction = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare transaction data for API
      const apiTransactionData = {
        date: format(new Date(transactionData.date), 'yyyy-MM-dd'),
        description: transactionData.description,
        category: transactionData.category,
        amount: parseFloat(transactionData.amount) * (transactionData.isIncome ? 1 : -1),
        isReconciled: transactionData.isReconciled
      };
      
      if (currentTransaction) {
        // Update existing transaction
        await updateTransaction(currentTransaction.id, apiTransactionData);
        setSuccess('Transaction updated successfully');
      } else {
        // Create new transaction
        await createTransaction(apiTransactionData);
        setSuccess('Transaction created successfully');
      }
      
      // Close dialog and refresh data
      handleCloseDialog();
      setRefreshData(prev => !prev);
    } catch (error) {
      setError(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      
      try {
        await deleteTransaction(id);
        setSuccess('Transaction deleted successfully');
        
        // Refresh data after deletion
        setRefreshData(prev => !prev);
      } catch (error) {
        setError(error.message || 'Failed to delete transaction');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleToggleReconciled = async (transaction) => {
    setLoading(true);
    setError('');
    
    try {
      // Prepare updated transaction data
      const updatedTransaction = {
        ...transaction,
        isReconciled: !transaction.isReconciled
      };
      
      // Call API to update transaction
      await updateTransaction(transaction.id, updatedTransaction);
      
      // Refresh data after update
      setRefreshData(prev => !prev);
    } catch (error) {
      setError(error.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleFilterCategory = (event) => {
    setFilterCategory(event.target.value);
    setPage(0);
  };
  
  // Filter transactions by search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate summary data
  const summaryData = {
    totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    // FIXED: Calculate the balance as totalIncome - totalExpenses to get the correct current balance
    balance: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) - 
             Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    transactionCount: transactions.length,
    categoryStats: Array.isArray(categories) ? categories.map(category => ({
      name: category,
      amount: Math.abs(transactions.filter(t => t.category === category).reduce((sum, t) => sum + t.amount, 0))
    })).sort((a, b) => b.amount - a.amount) : []
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transaction Management
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Current Balance
              </Typography>
              <Typography variant="h4" sx={{ color: summaryData.balance >= 0 ? 'success.main' : 'error.main' }}>
                ${summaryData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Total Income
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                ${summaryData.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                ${summaryData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Transactions
              </Typography>
              <Typography variant="h4">
                {summaryData.transactionCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Transaction Tools */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="ALL TRANSACTIONS" />
            <Tab label="INCOME" />
            <Tab label="EXPENSES" />
          </Tabs>
          
          <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Transaction
            </Button>
            
            <TextField
              placeholder="Search transactions..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 300 }}
            />
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="category-filter-label">Filter by Category</InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={filterCategory}
                label="Filter by Category"
                onChange={handleFilterCategory}
                displayEmpty
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}
        
        {/* Transaction Table */}
        {loading && !transactions.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction) => (
                      <TableRow 
                        key={transaction.id}
                        hover
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: transaction.isReconciled ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.category} 
                            size="small"
                            color={transaction.amount > 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ color: transaction.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                          ${Math.abs(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="right">
                          ${transaction.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={transaction.isReconciled ? "Reconciled" : "Not Reconciled"}>
                            <IconButton 
                              size="small" 
                              color={transaction.isReconciled ? "success" : "default"}
                              onClick={() => handleToggleReconciled(transaction)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredTransactions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
        
        {/* Transaction Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Transaction Date"
                  value={transactionData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                  <Select
                    labelId="transaction-type-label"
                    name="isIncome"
                    value={transactionData.isIncome}
                    label="Transaction Type"
                    onChange={(e) => handleTransactionChange({
                      target: { name: 'isIncome', value: e.target.value }
                    })}
                  >
                    <MenuItem value={true}>Income</MenuItem>
                    <MenuItem value={false}>Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={transactionData.description}
                  onChange={handleTransactionChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={transactionData.category}
                    label="Category"
                    onChange={handleTransactionChange}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  value={transactionData.amount}
                  onChange={handleTransactionChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isReconciled"
                      checked={transactionData.isReconciled}
                      onChange={handleTransactionChange}
                      color="primary"
                    />
                  }
                  label="Mark as reconciled"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTransaction} 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Transactions;