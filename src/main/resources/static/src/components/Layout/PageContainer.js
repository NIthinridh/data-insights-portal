// src/components/Layout/PageContainer.js
import React from 'react';
import { Box } from '@mui/material';

/**
 * PageContainer component to provide consistent layout for all pages
 * This component ensures content stretches to fill the available space
 */
const PageContainer = ({ children }) => {
  return (
    <Box
      className="page-container"
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;