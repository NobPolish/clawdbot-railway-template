import axios, { AxiosInstance } from 'axios';
import { BACKEND_CONFIG } from './api-config';

/**
 * API Client for Backend Communication
 * Handles token management, request/response interceptors, and error handling
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_CONFIG.baseURL,
  timeout: BACKEND_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: BACKEND_CONFIG.withCredentials,
});

/**
 * Request Interceptor
 * Attaches authentication token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[v0] Request with token:', config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error('[v0] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses, errors, and token refresh logic
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('[v0] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.warn('[v0] Unauthorized - clearing auth');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Redirect to login would be handled by the auth context
        window.location.href = '/auth/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('[v0] Forbidden - insufficient permissions');
    }

    // Handle network errors
    if (!error.response) {
      console.error('[v0] Network error - backend may be offline');
    }

    console.error('[v0] API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default apiClient;

