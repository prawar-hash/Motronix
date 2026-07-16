import apiClient from './apiClient';

export const fraudApi = {
  // Retrieves the fraud warning report and detailed flags for a listing
  getFraudReport: async (listingId) => {
    const response = await apiClient.get(`/fraud/report/${listingId}/`);
    return response.data;
  },
};
