/**
 * Client-side configuration
 */

// Get the base URL for the application
const getBaseUrl = () => {
  // Check if we're in a subpath deployment
  const pathname = window.location.pathname;
  const subpathMatch = pathname.match(/^\/([^/]+)/);
  
  // If we're in a subpath deployment, use that as the base URL
  if (subpathMatch && subpathMatch[1] !== 'api') {
    return `/${subpathMatch[1]}`;
  }
  
  // Otherwise, use the root
  return '';
};

// Get the API URL
const getApiUrl = () => {
  const baseUrl = process.env.REACT_APP_API_URL || '';
  
  // If API URL is explicitly set, use it
  if (baseUrl) {
    return baseUrl;
  }
  
  // Otherwise, construct it based on the current location
  const appBaseUrl = getBaseUrl();
  
  // In development, use the proxy configured in package.json
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  
  // In production, use the current location with /api
  return `${appBaseUrl}/api`;
};
const config = {
  baseUrl: getBaseUrl(),
  apiUrl: getApiUrl()
};

export default config;