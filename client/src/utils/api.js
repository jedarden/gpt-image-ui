import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle relative URLs for images
api.interceptors.request.use(
  (config) => {
    // If the URL is for an image and doesn't start with http/https,
    // make sure it's properly prefixed with the baseURL
    if (config.url && config.url.startsWith('/api/images/') && !config.url.startsWith('http')) {
      // Make sure we don't double-prefix the URL
      if (!config.url.startsWith(api.defaults.baseURL)) {
        config.url = `${api.defaults.baseURL}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;