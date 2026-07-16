import apiClient from './apiClient';

export const maintenanceApi = {
  // Retrieves service records owned by the current user
  getRecords: async () => {
    const response = await apiClient.get('/maintenance/');
    return response.data;
  },

  // Logs a new service history action
  createRecord: async (data) => {
    const response = await apiClient.post('/maintenance/', data);
    return response.data;
  },

  // Retrieves the predicted schedule and part failures based on current mileage
  getPrediction: async (currentMileage) => {
    const response = await apiClient.get('/maintenance/predict/', {
      params: { current_mileage: parseFloat(currentMileage) },
    });
    return response.data;
  },
};
