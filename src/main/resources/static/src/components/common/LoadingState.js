// src/components/common/LoadingState.js
import React from 'react';
import { CircularProgress, Box, Typography, LinearProgress } from '@mui/material';

const LoadingState = ({ 
  type = 'spinner', 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 60;
      case 'medium':
      default: return 40;
    }
  };
  
  const renderContent = () => {
    switch (type) {
      case 'linear':
        return (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            {text && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {text}
              </Typography>
            )}
          </Box>
        );
      case 'spinner':
      default:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={getSize()} />
            {text && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {text}
              </Typography>
            )}
          </Box>
        );
    }
  };
  
  if (fullScreen) {
    return (
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999
        }}
      >
        {renderContent()}
      </Box>
    );
  }
  
  return renderContent();
};

export default LoadingState;