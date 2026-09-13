import axios from 'axios';

// Resolve API URL dynamically from environment or default to local backend
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const baseURL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const API_BASE_URL = baseURL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careernav_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 / 403 error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Clear stored token and redirect to appropriate portal if not already on login
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          localStorage.removeItem('careernav_token');
          localStorage.removeItem('careernav_user');
          localStorage.removeItem('careernav_role');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
