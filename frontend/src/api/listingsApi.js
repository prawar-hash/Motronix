import apiClient from './apiClient';

export const listingsApi = {
  // Retrieves listings from the catalog with optional search/filter query parameters
  getListings: async (params = {}) => {
    const response = await apiClient.get('/listings/', { params });
    return response.data;
  },

  // Retrieves details for a specific listing
  getListing: async (id) => {
    const response = await apiClient.get(`/listings/${id}/`);
    return response.data;
  },

  // Creates a new bike listing (which triggers ML predictions)
  createListing: async (data) => {
    const response = await apiClient.post('/listings/', data);
    return response.data;
  },

  // Uploads a listing photo to Cloudinary
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/listings/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Soft-deletes a listing (seller or staff only)
  deleteListing: async (id) => {
    const response = await apiClient.delete(`/listings/${id}/`);
    return response.data;
  },
};
