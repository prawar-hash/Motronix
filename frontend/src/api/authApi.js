import apiClient from './apiClient';

export const authApi = {
  // Signs up a new user
  signup: async (email, name, password) => {
    const response = await apiClient.post('/users/signup/', { email, name, password });
    return response.data;
  },

  // Obtains JWT token pair
  login: async (email, password) => {
    const response = await apiClient.post('/users/login/', { email, password });
    return response.data;
  },

  // Fetches current authenticated user profile
  getProfile: async () => {
    const response = await apiClient.get('/users/profile/');
    return response.data;
  },
};
