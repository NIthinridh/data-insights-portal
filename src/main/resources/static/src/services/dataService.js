import apiClient from './api';

const DataService = {
  // Import data file
  importFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/data/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Get import history
  getImportHistory: async () => {
    const response = await apiClient.get('/api/data/imports');
    return response.data;
  },
};

export default DataService;