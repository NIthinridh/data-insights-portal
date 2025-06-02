// src/components/dashboard/GoalsProgressWidget.js - FIXED
import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  // Remove ListItemText if unused
  Card,
  CardContent,
  Button
} from '@mui/material';
// Remove format import if unused
import { useNavigate } from 'react-router-dom';

const GoalsProgressWidget = ({ goals }) => {
  const navigate = useNavigate();
  
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Financial Goals</Typography>
          <Typography variant="body2" color="textSecondary">
            No goals have been set. Set your first financial goal to track progress.
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/goals')}
          >
            Create Goals
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress
  const totalProgress = goals.reduce((sum, goal) => {
    return sum + (goal.currentAmount / goal.targetAmount) * 100;
  }, 0) / goals.length;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Financial Goals</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Overall Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(totalProgress, 100)} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="textSecondary">
                {Math.round(totalProgress)}%
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <List sx={{ p: 0 }}>
          {goals.slice(0, 3).map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <ListItem key={goal.id} sx={{ px: 0, py: 1 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{goal.name}</Typography>
                    <Typography variant="body2">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
            );
          })}
        </List>
        
        <Button 
          variant="text" 
          size="small" 
          sx={{ mt: 1 }}
          onClick={() => navigate('/goals')}
        >
          View All Goals
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoalsProgressWidget;