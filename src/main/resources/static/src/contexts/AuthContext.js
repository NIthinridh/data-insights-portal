// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
export const api = apiClient; // Keep this export for backward compatibility

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        // Validate token format
        if (token.split('.').length !== 3) {
          console.error('Invalid token format in localStorage');
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }
        
        const decodedToken = jwtDecode(token);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Create user from token data first as a fallback
          setUser({
            username: decodedToken.sub,
            role: decodedToken.roles || decodedToken.role || 'USER'
          });
          
          // Then try to get user profile from API
          try {
            const response = await apiClient.get('/api/auth/me');
            if (response.data) {
              setUser(response.data);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            // We already set basic user data from token above
          }
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate inputs
      if (!credentials.username || !credentials.username.trim()) {
        setError('Username is required');
        return false;
      }
      if (!credentials.password || !credentials.password.trim()) {
        setError('Password is required');
        return false;
      }
      
      // Log the request for debugging
      console.log('Attempting login with:', credentials.username);
      
      // Make the request to the correct endpoint
      const response = await apiClient.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      
      // The backend returns a JwtAuthenticationResponse object
      const { accessToken } = response.data;
      
      if (!accessToken) {
        console.error('No token in response:', response.data);
        setError('Invalid server response');
        return false;
      }
      
      // Store the token
      localStorage.setItem('token', accessToken);
      console.log('Token stored in localStorage');
      
      // Set user data from response
      const userData = {
        id: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
      return true;
      
    } catch (err) {
      console.error('Login error complete details:', err);
      
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
        
        // Try to extract a meaningful error message
        let errorMessage = 'Login failed';
        
        if (err.response.status === 400) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.status === 403) {
          errorMessage = 'Access denied';
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.statusText) {
          errorMessage = `${err.response.status}: ${err.response.statusText}`;
        }
        
        setError(errorMessage);
      } else if (err.request) {
        console.error('No response received from server');
        setError('No response received from server. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError(err.message || 'An unknown error occurred');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/auth/register', userData);
      console.log('Register response:', response.data);
      
      // Extract token from response - check multiple possible formats
      const token = response.data.accessToken || response.data.token;
      
      if (token) {
        localStorage.setItem('token', token);
        
        let userDataFromResponse = {};
        
        if (response.data.userId || response.data.id) {
          userDataFromResponse.id = response.data.userId || response.data.id;
        }
        
        if (response.data.username) {
          userDataFromResponse.username = response.data.username;
        }
        
        if (response.data.email) {
          userDataFromResponse.email = response.data.email;
        }
        
        if (response.data.role) {
          userDataFromResponse.role = response.data.role;
        }
        
        // If we have a user object in the response, use that
        if (response.data.user) {
          userDataFromResponse = { ...userDataFromResponse, ...response.data.user };
        }
        
        setUser(userDataFromResponse);
        return true;
      } else {
        setError('Registration successful but no authentication token received');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        // Try to extract a meaningful error message
        let errorMessage = 'Registration failed';
        
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
        
        setError(errorMessage);
      } else {
        setError('Registration failed');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put('/api/users/profile', userData);
      setUser(response.data);
      
      return true;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.put('/api/users/change-password', passwordData);
      return true;
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data || 'Password change failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;