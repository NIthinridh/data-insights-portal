// src/components/TokenDebugger.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const TokenDebugger = () => {
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      
      try {
        const decoded = jwtDecode(storedToken);
        setDecodedToken(decoded);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        setIsExpired(decoded.exp < currentTime);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);
  
  const clearToken = () => {
    localStorage.removeItem('token');
    setToken('');
    setDecodedToken(null);
    setIsExpired(false);
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>JWT Token Debugger</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Stored Token</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {token || 'No token found'}
        </pre>
        
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={clearToken}
          sx={{ mt: 2 }}
          disabled={!token}
        >
          Clear Token
        </Button>
      </Paper>
      
      {decodedToken && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Decoded Token</Typography>
          <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
            {JSON.stringify(decodedToken, null, 2)}
          </pre>
          
          <Typography color={isExpired ? 'error' : 'success'} sx={{ mt: 2 }}>
            Token status: {isExpired ? 'EXPIRED' : 'VALID'}
          </Typography>
          
          {decodedToken.exp && (
            <Typography variant="body2">
              Expires at: {new Date(decodedToken.exp * 1000).toLocaleString()}
            </Typography>
          )}
        </Paper>
      )}
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Troubleshooting Tips</Typography>
        <ul>
          <li>Make sure the token has the correct format (header.payload.signature)</li>
          <li>Check if the token is expired</li>
          <li>Verify the token contains the necessary roles/permissions</li>
          <li>Ensure the token is properly included in API requests</li>
          <li>Check that the backend correctly validates the token</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default TokenDebugger;