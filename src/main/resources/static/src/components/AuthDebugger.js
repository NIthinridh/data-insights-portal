// src/components/AuthDebugger.js
import React, { useEffect, useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';

const AuthDebugger = () => {
  const { user } = useAuth();
  const [publicResponse, setPublicResponse] = useState(null);
  const [authResponse, setAuthResponse] = useState(null);
  const [headersResponse, setHeadersResponse] = useState(null);
  const [tokenDebugResponse, setTokenDebugResponse] = useState(null);
  const [error, setError] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const testEndpoints = () => {
    setLoading(true);
    setError({});
    
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken ? `${storedToken.substring(0, 20)}...` : 'No token found');

    // Test public endpoint
    apiClient.get('/api/diagnostic/public')
      .then(res => {
        console.log('Public endpoint response:', res);
        setPublicResponse(res.data);
      })
      .catch(err => {
        console.error('Public endpoint error:', err);
        setError(prev => ({ ...prev, public: err.response?.data || err.message }));
      });

    // Test authenticated endpoint
    apiClient.get('/api/diagnostic/authenticated')
      .then(res => {
        console.log('Authenticated endpoint response:', res);
        setAuthResponse(res.data);
      })
      .catch(err => {
        console.error('Authenticated endpoint error:', err);
        setError(prev => ({ ...prev, auth: err.response?.data || err.message }));
      });
      
    // Test headers endpoint
    apiClient.get('/api/diagnostic/headers')
      .then(res => {
        console.log('Headers response:', res);
        setHeadersResponse(res.data);
      })
      .catch(err => {
        console.error('Headers error:', err);
        setError(prev => ({ ...prev, headers: err.response?.data || err.message }));
      });
      
    // Test token debug endpoint if available
    apiClient.get('/api/diagnostic/auth-check')
      .then(res => {
        console.log('Auth check response:', res);
        setTokenDebugResponse(res.data);
      })
      .catch(err => {
        console.error('Auth check error:', err);
        setError(prev => ({ ...prev, tokenDebug: err.response?.data || err.message }));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Authentication Debugger</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={testEndpoints} 
        sx={{ mb: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Re-test Endpoints'}
      </Button>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Current User</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {JSON.stringify(user, null, 2) || 'Not logged in'}
        </pre>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Stored Token (truncated)</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {token || 'No token found'}
        </pre>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Public Endpoint Response</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {loading ? 'Loading...' : JSON.stringify(publicResponse, null, 2) || 'No response'}
        </pre>
        {error?.public && (
          <Typography color="error">Error: {error.public}</Typography>
        )}
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Authenticated Endpoint Response</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {loading ? 'Loading...' : JSON.stringify(authResponse, null, 2) || 'No response'}
        </pre>
        {error?.auth && (
          <Typography color="error">Error: {error.auth}</Typography>
        )}
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Headers Response</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {loading ? 'Loading...' : JSON.stringify(headersResponse, null, 2) || 'No response'}
        </pre>
        {error?.headers && (
          <Typography color="error">Error: {error.headers}</Typography>
        )}
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Auth Check Response</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {loading ? 'Loading...' : JSON.stringify(tokenDebugResponse, null, 2) || 'No response'}
        </pre>
        {error?.tokenDebug && (
          <Typography color="error">Error: {error.tokenDebug}</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Troubleshooting Tips</Typography>
        <ul>
          <li>Check if token is present and properly formatted</li>
          <li>Verify that the token is not expired</li>
          <li>Ensure the Authorization header is correctly set with 'Bearer ' prefix</li>
          <li>Check server logs for JWT validation errors</li>
          <li>Make sure CORS is properly configured</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default AuthDebugger;