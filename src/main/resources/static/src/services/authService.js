import apiClient from './api';

const AuthService = {
  login: async (username, password) => {
    // Make sure we're sending a properly formatted JSON object
    const response = await apiClient.post('/api/auth/login', {
      username: username,
      password: password
    });
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default AuthService;