import apiClient from './apiClient';

export const ridingStyleApi = {
  // Retrieves previous riding style logs
  getHistory: async () => {
    const response = await apiClient.get('/riding-style/history/');
    return response.data;
  },

  // Uploads a ride data CSV for analysis
  uploadRideData: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/riding-style/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Returns the download URL for the template CSV file
  getTemplateDownloadUrl: () => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    return `${baseURL}/riding-style/template/`;
  },
};
