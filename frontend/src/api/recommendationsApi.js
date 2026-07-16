import apiClient from './apiClient';

export const recommendationsApi = {
  // Query personalized recommendations
  getRecommendations: async (budget, usage, preferredMileage) => {
    const response = await apiClient.post('/recommendations/', {
      budget: parseFloat(budget),
      usage,
      preferred_mileage: parseFloat(preferredMileage),
    });
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
