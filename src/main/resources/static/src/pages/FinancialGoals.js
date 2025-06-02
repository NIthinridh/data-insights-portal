// src/pages/FinancialGoals.js - FIXED AND STRETCHED
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  MonetizationOn as MoneyIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { differenceInMonths, differenceInDays, format, isAfter } from 'date-fns';

// Import goal service
import { 
  getAllGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  addContribution 
} from '../services/goalService';

// Sample categories for goals - ideally these would come from an API
const goalCategories = [
  'Emergency Fund',
  'Home Purchase',
  'Car Purchase',
  'Vacation',
  'Education',
  'Retirement',
  'Wedding',
  'Debt Payoff',
  'Investment',
  'Other'
];

const FinancialGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [goalData, setGoalData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    startDate: new Date(),
    targetDate: null,
    category: '',
    priority: 'Medium',
    notes: ''
  });
  const [openContributionDialog, setOpenContributionDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  
  // Move fetchGoals outside of useEffect and use useCallback to memoize
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getAllGoals();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
      
      // Keep existing goals if available
      if (goals.length === 0) {
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  }, [goals.length]);
  
  useEffect(() => {
    // Fetch goals
    fetchGoals();
  }, [refreshData, fetchGoals]); // Add fetchGoals to dependency array
  
  const handleOpenDialog = (goal = null) => {
    if (goal) {
      // Edit existing goal
      setCurrentGoal(goal);
      setGoalData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        startDate: new Date(goal.startDate),
        targetDate: new Date(goal.targetDate),
        category: goal.category,
        priority: goal.priority,
        notes: goal.notes || ''
      });
    } else {
      // New goal
      setCurrentGoal(null);
      setGoalData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        startDate: new Date(),
        targetDate: null,
        category: '',
        priority: 'Medium',
        notes: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGoal(null);
  };
  
  const handleGoalChange = (event) => {
    const { name, value } = event.target;
    setGoalData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date, field) => {
    setGoalData(prev => ({
      ...prev,
      [field]: date
    }));
  };
  
  const validateForm = () => {
    if (!goalData.name.trim()) {
      setError('Goal name is required');
      return false;
    }
    
    if (!goalData.targetAmount || isNaN(parseFloat(goalData.targetAmount)) || parseFloat(goalData.targetAmount) <= 0) {
      setError('Valid target amount is required');
      return false;
    }
    
    if (!goalData.currentAmount && goalData.currentAmount !== '0') {
      setGoalData(prev => ({
        ...prev,
        currentAmount: '0'
      }));
    } else if (isNaN(parseFloat(goalData.currentAmount)) || parseFloat(goalData.currentAmount) < 0) {
      setError('Valid current amount is required');
      return false;
    }
    
    if (parseFloat(goalData.currentAmount) > parseFloat(goalData.targetAmount)) {
      setError('Current amount cannot exceed target amount');
      return false;
    }
    
    if (!goalData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!goalData.targetDate) {
      setError('Target date is required');
      return false;
    }
    
    if (goalData.targetDate <= goalData.startDate) {
      setError('Target date must be after start date');
      return false;
    }
    
    if (!goalData.category) {
      setError('Category is required');
      return false;
    }
    
    return true;
  };
  
  const handleSaveGoal = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare goal data for API
      const apiGoalData = {
        name: goalData.name,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount),
        startDate: format(new Date(goalData.startDate), 'yyyy-MM-dd'),
        targetDate: format(new Date(goalData.targetDate), 'yyyy-MM-dd'),
        category: goalData.category,
        priority: goalData.priority,
        notes: goalData.notes
      };
      
      if (currentGoal) {
        // Update existing goal
        await updateGoal(currentGoal.id, apiGoalData);
        setSuccess('Goal updated successfully');
      } else {
        // Create new goal
        await createGoal(apiGoalData);
        setSuccess('Goal created successfully');
      }
      
      // Close dialog and refresh data
      handleCloseDialog();
      setRefreshData(prev => !prev);
    } catch (error) {
      setError(error.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      
      try {
        await deleteGoal(id);
        setSuccess('Goal deleted successfully');
        
        // Refresh data after deletion
        setRefreshData(prev => !prev);
      } catch (error) {
        setError(error.message || 'Failed to delete goal');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleOpenContributionDialog = (goal) => {
    setCurrentGoal(goal);
    setContributionAmount('');
    setOpenContributionDialog(true);
  };
  
  const handleCloseContributionDialog = () => {
    setOpenContributionDialog(false);
    setCurrentGoal(null);
    setContributionAmount('');
  };
  
  const handleContributionChange = (event) => {
    setContributionAmount(event.target.value);
  };
  
  const handleAddContribution = async () => {
    if (!contributionAmount || isNaN(parseFloat(contributionAmount)) || parseFloat(contributionAmount) <= 0) {
      setError('Valid contribution amount is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const amount = parseFloat(contributionAmount);
      
      // Call API to add contribution
      await addContribution(currentGoal.id, amount);
      
      setSuccess(`$${amount.toFixed(2)} added to ${currentGoal.name}`);
      handleCloseContributionDialog();
      
      // Refresh data after adding contribution
      setRefreshData(prev => !prev);
    } catch (error) {
      setError(error.message || 'Failed to add contribution');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryFilter = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  // Filter goals by category
  const filteredGoals = selectedCategory 
    ? goals.filter(goal => goal.category === selectedCategory)
    : goals;
  
  // Calculate overall progress
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  
  // Calculate goals metrics
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
  const activeGoals = goals.length - completedGoals;
  const nearTargetGoals = goals.filter(goal => 
    goal.currentAmount < goal.targetAmount && 
    (goal.currentAmount / goal.targetAmount) >= 0.75
  ).length;
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          Financial Goals
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3, width: '100%' }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Overall Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(overallProgress, 100)} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: overallProgress >= 75 ? 'success.main' : 'primary.main'
                      }
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round(overallProgress)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4">
                ${totalCurrentAmount.toLocaleString()} / ${totalTargetAmount.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Active Goals
              </Typography>
              <Typography variant="h4">
                {activeGoals}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Completed Goals
              </Typography>
              <Typography variant="h4" color="success.main">
                {completedGoals}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" color="textSecondary">
                Near Target
              </Typography>
              <Typography variant="h4" color="info.main">
                {nearTargetGoals}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Controls */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Goal
          </Button>
          
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="category-filter-label">Filter by Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={selectedCategory}
              label="Filter by Category"
              onChange={handleCategoryFilter}
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              {goalCategories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}
        
        {/* Goals Grid */}
        {loading && !goals.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, flexGrow: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ flexGrow: 1, width: '100%' }}>
            {filteredGoals.length > 0 ? (
              filteredGoals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
                const monthsLeft = differenceInMonths(new Date(goal.targetDate), new Date());
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={goal.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderTop: '5px solid',
                        borderColor: isCompleted ? 'success.main' : 
                                  goal.priority === 'High' ? 'error.main' : 
                                  goal.priority === 'Medium' ? 'warning.main' : 'info.main'
                      }}
                    >
                      <CardHeader
                        title={goal.name}
                        titleTypographyProps={{
                          variant: 'h6',
                          component: 'div',
                          noWrap: true
                        }}
                        subheader={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={goal.category} 
                              size="small" 
                              color={
                                goal.category === 'Emergency Fund' ? 'error' :
                                goal.category === 'Home Purchase' ? 'primary' :
                                goal.category === 'Vacation' ? 'success' : 'default'
                              }
                            />
                            <Chip 
                              label={goal.priority} 
                              size="small" 
                              color={
                                goal.priority === 'High' ? 'error' :
                                goal.priority === 'Medium' ? 'warning' : 'info'
                              }
                            />
                          </Box>
                        }
                        action={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {isCompleted && (
                              <Tooltip title="Completed">
                                <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                              </Tooltip>
                            )}
                            <IconButton 
                              aria-label="edit"
                              onClick={() => handleOpenDialog(goal)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        }
                      />
                      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom component="div">
                          Progress
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(progress, 100)} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: isCompleted ? 'success.main' : 'primary.main'
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="textSecondary">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          {/* Fixed nesting issues by using Box as container */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MoneyIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">Current:</Typography>
                            </Box>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                              ${goal.currentAmount.toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FlagIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">Target:</Typography>
                            </Box>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                              ${goal.targetAmount.toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">
                                {isAfter(new Date(goal.targetDate), new Date()) ? 'Time Left:' : 'Overdue by:'}
                              </Typography>
                            </Box>
                            <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                              {daysLeft > 0 ? 
                                (monthsLeft > 0 ? `${monthsLeft} months` : `${daysLeft} days`) :
                                (Math.abs(monthsLeft) > 0 ? `${Math.abs(monthsLeft)} months` : `${Math.abs(daysLeft)} days`)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {goal.notes && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="textSecondary">
                              {goal.notes}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenContributionDialog(goal)}
                          disabled={isCompleted}
                        >
                          Add Contribution
                        </Button>
                        <IconButton 
                          aria-label="delete"
                          onClick={() => handleDeleteGoal(goal.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    {goals.length === 0 ? 
                      'No goals found. Click "Add New Goal" to create your first goal.' : 
                      'No goals found matching the selected category.'}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
        
        {/* Goal Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Name"
                  name="name"
                  value={goalData.name}
                  onChange={handleGoalChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  name="targetAmount"
                  value={goalData.targetAmount}
                  onChange={handleGoalChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Amount"
                  name="currentAmount"
                  value={goalData.currentAmount}
                  onChange={handleGoalChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={goalData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Target Date"
                  value={goalData.targetDate}
                  onChange={(date) => handleDateChange(date, 'targetDate')}
                  slotProps={{ textField: { fullWidth: true } }}
                  minDate={goalData.startDate || undefined}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={goalData.category}
                    label="Category"
                    onChange={handleGoalChange}
                  >
                    {goalCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    name="priority"
                    value={goalData.priority}
                    label="Priority"
                    onChange={handleGoalChange}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  name="notes"
                  value={goalData.notes}
                  onChange={handleGoalChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveGoal} 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Contribution Dialog */}
        <Dialog 
          open={openContributionDialog} 
          onClose={handleCloseContributionDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Add Contribution to {currentGoal?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Contribution Amount"
                value={contributionAmount}
                onChange={handleContributionChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              
              {currentGoal && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" gutterBottom component="div">Goal Progress</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Current Amount" 
                        secondary={`${currentGoal.currentAmount.toLocaleString()}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Target Amount" 
                        secondary={`${currentGoal.targetAmount.toLocaleString()}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Remaining" 
                        secondary={`${(currentGoal.targetAmount - currentGoal.currentAmount).toLocaleString()}`} 
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContributionDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddContribution} 
              variant="contained" 
              color="primary"
              disabled={!contributionAmount || isNaN(parseFloat(contributionAmount)) || parseFloat(contributionAmount) <= 0}
            >
              Add Contribution
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default FinancialGoals;