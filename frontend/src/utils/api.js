import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to headers if exists
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
    );
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global response error handler
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific status codes if needed
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized, token expired or invalid
        localStorage.removeItem(
          import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
        );
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
