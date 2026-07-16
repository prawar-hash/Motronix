import apiClient from './apiClient';

export const recommendationsApi = {
  // Query personalized recommendations using the 10-parameter payload
  getRecommendations: async (payload) => {
    const response = await apiClient.post('/recommendations/', payload);
    return response.data;
  },

  // Perform side-by-side spec comparison of 2-3 listings
  compareListings: async (listingIds) => {
    const response = await apiClient.post('/recommendations/compare/', {
      listing_ids: listingIds,
    });
    return response.data;
  },
};
