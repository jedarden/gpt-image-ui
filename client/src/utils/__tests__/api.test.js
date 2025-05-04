import axios from 'axios';
import api from '../api';

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    },
    defaults: {
      baseURL: '',
      headers: {
        common: {}
      }
    }
  };
  return mockAxios;
});

describe('API Service', () => {
  let requestInterceptor;
  let requestErrorHandler;
  let responseInterceptor;
  let responseErrorHandler;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the interceptor functions
    requestInterceptor = axios.interceptors.request.use.mock.calls[0][0];
    requestErrorHandler = axios.interceptors.request.use.mock.calls[0][1];
    responseInterceptor = axios.interceptors.response.use.mock.calls[0][0];
    responseErrorHandler = axios.interceptors.response.use.mock.calls[0][1];
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock window.location
    delete window.location;
    window.location = {
      pathname: '/',
      href: '/'
    };
  });
  
  it('should create an axios instance with the correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });
  
  it('should add Authorization header if token exists', () => {
    // Mock token in localStorage
    localStorage.getItem.mockReturnValueOnce('test-token');
    
    // Create a config object
    const config = {
      headers: {}
    };
    
    // Call the request interceptor
    const result = requestInterceptor(config);
    
    // Check that the token was added to the headers
    expect(result.headers.Authorization).toBe('Bearer test-token');
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
  
  it('should not add Authorization header if token does not exist', () => {
    // Mock no token in localStorage
    localStorage.getItem.mockReturnValueOnce(null);
    
    // Create a config object
    const config = {
      headers: {}
    };
    
    // Call the request interceptor
    const result = requestInterceptor(config);
    
    // Check that no Authorization header was added
    expect(result.headers.Authorization).toBeUndefined();
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
  
  it('should reject request errors', async () => {
    const error = new Error('Request error');
    
    // Call the request error handler
    await expect(requestErrorHandler(error)).rejects.toThrow('Request error');
  });
  
  it('should return response data', () => {
    const response = { data: { message: 'Success' } };
    
    // Call the response interceptor
    const result = responseInterceptor(response);
    
    // Check that the response was returned unchanged
    expect(result).toBe(response);
  });
  
  it('should handle 401 errors by clearing token and redirecting', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
    
    // Call the response error handler
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Check that the token was removed from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Check that the user was redirected to login
    expect(window.location.href).toBe('/login');
  });
  
  it('should not redirect if already on login page', async () => {
    // Set current path to login
    window.location.pathname = '/login';
    
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
    
    // Call the response error handler
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Check that the token was removed from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    
    // Check that no redirect happened
    expect(window.location.href).toBe('/');
  });
  
  it('should reject other response errors without clearing token', async () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Server error' }
      }
    };
    
    // Call the response error handler
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Check that the token was not removed from localStorage
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    
    // Check that no redirect happened
    expect(window.location.href).toBe('/');
  });
  
  it('should handle errors without response object', async () => {
    const error = new Error('Network error');
    
    // Call the response error handler
    await expect(responseErrorHandler(error)).rejects.toEqual(error);
    
    // Check that the token was not removed from localStorage
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    
    // Check that no redirect happened
    expect(window.location.href).toBe('/');
  });
});