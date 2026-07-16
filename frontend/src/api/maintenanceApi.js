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

  // Retrieves the predicted schedule based on mileage, brand, and model
  getPrediction: async (currentMileage, brand, model) => {
    const response = await apiClient.get('/maintenance/predict/', {
      params: { 
        current_mileage: parseFloat(currentMileage),
        brand: brand || 'Other',
        model: model || 'Other'
      },
    });
    return response.data;
  },

  // Updates a logged service record
  updateRecord: async (id, data) => {
    const response = await apiClient.put(`/maintenance/${id}/`, data);
    return response.data;
  },

  // Deletes a logged service record
  deleteRecord: async (id) => {
    const response = await apiClient.delete(`/maintenance/${id}/`);
    return response.data;
  },
};
