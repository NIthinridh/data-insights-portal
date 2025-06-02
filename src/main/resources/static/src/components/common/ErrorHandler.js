// src/components/common/ErrorHandler.js - FIXED
import React from 'react';
import { Typography, Alert } from '@mui/material';
// Remove Box from import if it's not used

const ErrorHandler = ({ error }) => {
  if (!error) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <Typography variant="body1">{error.message || 'An unexpected error occurred'}</Typography>
    </Alert>
  );
};

export default ErrorHandler;