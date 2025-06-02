import apiClient from '../services/api';

export const getImportHistory = async () => {
  try {
    const response = await apiClient.get('/api/data/imports');
    console.log('Import history response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching import history:', error);
    throw error; // Propagate the error for component-level handling
  }
};

export const uploadFile = async (file, options) => {
  try {
    // Create form data for multipart file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add options as form fields
    if (options) {
      for (const key in options) {
        formData.append(key, options[key]);
      }
    }
    
    console.log('Uploading file with options:', options);
    
    const response = await apiClient.post('/api/data/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(error.response?.data || 'Failed to upload file');
  }
};

export const getImportJobDetails = async (id) => {
  try {
    const response = await apiClient.get(`/api/data/imports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching import job details for ID ${id}:`, error);
    throw error;
  }
};

export const deleteImportJob = async (id) => {
  try {
    const response = await apiClient.delete(`/api/data/imports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting import job ID ${id}:`, error);
    throw error;
  }
};