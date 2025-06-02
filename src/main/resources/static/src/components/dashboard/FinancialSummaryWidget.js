// src/components/dashboard/FinancialSummaryWidget.js
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import DashboardWidget from '../common/DashboardWidget';
import BarChartIcon from '@mui/icons-material/BarChart';

const FinancialSummaryWidget = ({ summaryData }) => {
  // Example data structure for summaryData
  // {
  //   income: 5000,
  //   expenses: 3000,
  //   balance: 2000,
  //   savingsRate: 40,
  //   trend: 15, // percentage change from previous period
  //   categories: [
  //     { name: 'Housing', amount: 1200, percentage: 40 },
  //     { name: 'Food', amount: 800, percentage: 26.67 },
  //     { name: 'Transportation', amount: 500, percentage: 16.67 },
  //     { name: 'Entertainment', amount: 300, percentage: 10 },
  //     { name: 'Other', amount: 200, percentage: 6.67 }
  //   ]
  // }

  // Default data if none provided
  const defaultData = {
    income: 5000,
    expenses: 3000,
    balance: 2000,
    savingsRate: 40,
    trend: 15,
    categories: [
      { name: 'Housing', amount: 1200, percentage: 40 },
      { name: 'Food', amount: 800, percentage: 26.67 },
      { name: 'Transportation', amount: 500, percentage: 16.67 },
      { name: 'Entertainment', amount: 300, percentage: 10 },
      { name: 'Other', amount: 200, percentage: 6.67 }
    ]
  };

  const data = summaryData || defaultData;

  return (
    <DashboardWidget
      title="Financial Summary"
      icon={<BarChartIcon />}
      actionText="View Analytics"
      actionPath="/analytics"
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Monthly Overview
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">Income</Typography>
            <Typography variant="h6" color="success.main">
              ${data.income.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">Expenses</Typography>
            <Typography variant="h6" color="error.main">
              ${data.expenses.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">Balance</Typography>
            <Typography variant="h6" color={data.balance >= 0 ? "success.main" : "error.main"}>
              ${data.balance.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2">Savings Rate</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                {data.savingsRate}%
              </Typography>
              {data.trend !== 0 && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: data.trend > 0 ? 'success.main' : 'error.main',
                    ml: 1 
                  }}
                >
                  {data.trend > 0 ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : (
                    <TrendingDownIcon fontSize="small" />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ color: data.trend > 0 ? 'success.main' : 'error.main' }}
                  >
                    {Math.abs(data.trend)}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={data.savingsRate} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: data.savingsRate >= 20 ? 'success.main' : 'warning.main'
              }
            }}
          />
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Top Expense Categories
      </Typography>
      
      <List dense>
        {data.categories.slice(0, 3).map((category) => (
          <ListItem 
            key={category.name}
            disableGutters 
            sx={{ px: 0 }}
          >
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{category.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      ${category.amount.toLocaleString()}
                    </Typography>
                    <Chip 
                      label={`${category.percentage}%`} 
                      size="small" 
                      color={
                        category.percentage > 50 ? 'error' :
                        category.percentage > 30 ? 'warning' : 'default'
                      }
                    />
                  </Box>
                </Box>
              }
              secondary={
                <LinearProgress 
                  variant="determinate" 
                  value={category.percentage} 
                  sx={{ 
                    height: 5, 
                    borderRadius: 5,
                    mt: 0.5,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 
                        category.percentage > 50 ? 'error.main' :
                        category.percentage > 30 ? 'warning.main' : 'info.main'
                    }
                  }}
                />
              }
            />
          </ListItem>
        ))}
      </List>
    </DashboardWidget>
  );
};

export default FinancialSummaryWidget;