import apiClient from '../services/api';

/**
 * Utility function to test connectivity between frontend and backend
 * This can be called when your app initializes to verify connections
 */
export const testBackendConnectivity = async () => {
  try {
    // Simple ping to backend
    const response = await apiClient.get('/api/health');
    console.log('Backend connectivity test successful:', response.data);
    return {
      success: true,
      message: 'Connected to backend successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Backend connectivity test failed:', error);
    return {
      success: false,
      message: 'Failed to connect to backend',
      error: error.message
    };
  }
};

/**
 * Test database connectivity through backend
 */
export const testDatabaseConnectivity = async () => {
  try {
    const response = await apiClient.get('/api/health/database');
    console.log('Database connectivity test successful:', response.data);
    return {
      success: true,
      message: 'Database connection successful',
      data: response.data
    };
  } catch (error) {
    console.error('Database connectivity test failed:', error);
    return {
      success: false,
      message: 'Failed to connect to database',
      error: error.message
    };
  }
};