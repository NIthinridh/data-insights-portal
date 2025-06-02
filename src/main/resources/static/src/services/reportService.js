import apiClient from '../services/api';

export const getReports = async () => {
  try {
    const response = await apiClient.get('/api/reports');
    return response.data;
  } catch (error) {
    console.error('Get reports error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

export const getReport = async (reportId) => {
  try {
    const response = await apiClient.get(`/api/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Get report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch report');
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await apiClient.post('/api/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Create report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create report');
  }
};

export const updateReport = async (reportId, reportData) => {
  try {
    const response = await apiClient.put(`/api/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    console.error('Update report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update report');
  }
};

export const deleteReport = async (reportId) => {
  try {
    await apiClient.delete(`/api/reports/${reportId}`);
    return true;
  } catch (error) {
    console.error('Delete report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete report');
  }
};

export const downloadReport = async (reportId, format = 'pdf') => {
  try {
    const response = await apiClient.get(`/api/reports/${reportId}/download?format=${format}`, {
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${reportId}.${format}`);
    document.body.appendChild(link);
    link.click();
    
    return true;
  } catch (error) {
    console.error('Download report error:', error);
    throw new Error(error.response?.data?.message || 'Failed to download report');
  }
};