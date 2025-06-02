// src/components/dashboard/RecentTransactionsWidget.js
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import DashboardWidget from '../common/DashboardWidget';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format, parseISO } from 'date-fns';

const RecentTransactionsWidget = ({ transactions = [] }) => {
  // Default data if none provided
  const defaultTransactions = [
    {
      id: 1,
      date: '2023-06-15',
      description: 'Grocery Store',
      category: 'Food',
      amount: -120.45
    },
    {
      id: 2,
      date: '2023-06-14',
      description: 'Monthly Salary',
      category: 'Income',
      amount: 3000
    },
    {
      id: 3,
      date: '2023-06-13',
      description: 'Electric Bill',
      category: 'Utilities',
      amount: -85.20
    },
    {
      id: 4,
      date: '2023-06-12',
      description: 'Restaurant Dinner',
      category: 'Food',
      amount: -52.75
    },
    {
      id: 5,
      date: '2023-06-10',
      description: 'Gas Station',
      category: 'Transportation',
      amount: -45.80
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : defaultTransactions;

  return (
    <DashboardWidget
      title="Recent Transactions"
      icon={<ReceiptIcon />}
      actionText="View All Transactions"
      actionPath="/transactions"
    >
      <List disablePadding>
        {displayTransactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                      {transaction.description}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: transaction.amount >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {transaction.amount >= 0 ? '+' : ''}
                      ${Math.abs(transaction.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="textSecondary">
                      {format(parseISO(transaction.date), 'MMM d, yyyy')}
                    </Typography>
                    <Chip
                      label={transaction.category}
                      size="small"
                      color={transaction.amount >= 0 ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </DashboardWidget>
  );
};

export default RecentTransactionsWidget;
