/**
 * API Utility Functions
 * 
 * This file contains utility functions for making API calls to the backend server.
 * In a production environment, this would be configured to use environment variables
 * for the API base URL.
 */

// Base API URL - replace with your actual API URL in production
const API_BASE_URL = 'https://gebeta-food-delivery.replit.app/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(`API Error: ${errorMessage}`);
    }
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * GET request
 */
export const get = async (endpoint: string) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetchWithErrorHandling(url);
};

/**
 * POST request
 */
export const post = async (endpoint: string, data: any) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  return fetchWithErrorHandling(url, options);
};

/**
 * PUT request
 */
export const put = async (endpoint: string, data: any) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  return fetchWithErrorHandling(url, options);
};

/**
 * PATCH request
 */
export const patch = async (endpoint: string, data: any) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  
  return fetchWithErrorHandling(url, options);
};

/**
 * DELETE request
 */
export const del = async (endpoint: string) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'DELETE',
  };
  
  return fetchWithErrorHandling(url, options);
};

// API Endpoints
export const API = {
  // Authentication
  login: (phoneNumber: string) => post('/login', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otp: string) => post('/verify-otp', { phoneNumber, otp }),
  
  // Restaurants
  getRestaurants: () => get('/restaurants'),
  getRestaurantById: (id: number) => get(`/restaurants/${id}`),
  getRestaurantFoodItems: (id: number) => get(`/restaurants/${id}/food-items`),
  
  // Orders
  createOrder: (orderData: any) => post('/orders', orderData),
  getOrderById: (id: string) => get(`/orders/${id}`),
  getUserOrders: () => get('/user/orders'),
  
  // User
  getUserProfile: () => get('/user'),
  updateUserProfile: (userData: any) => patch('/user', userData),
  
  // Reviews
  createReview: (reviewData: any) => post('/reviews', reviewData),
  getRestaurantReviews: (restaurantId: number) => get(`/restaurants/${restaurantId}/reviews`),
};