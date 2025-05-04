/**
 * Tests for API key validation middleware
 */

// Mock the config module
jest.mock('../../config', () => ({
  openai: {
    apiKey: null // Will be set in individual tests
  }
}));

const config = require('../../config');
const validateApiKey = require('../validate-api-key');

describe('API Key Validation Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express request, response, and next
    req = {};
    res = {};
    next = jest.fn();
  });
  
  it('should call next() when API key is configured', () => {
    // Set the API key in the mocked config
    config.openai.apiKey = 'test-api-key';
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called without an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
  
  it('should call next() with an error when API key is missing', () => {
    // Set the API key to null in the mocked config
    config.openai.apiKey = null;
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    
    // Get the error that was passed to next
    const error = next.mock.calls[0][0];
    
    // Check the error properties
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('OpenAI API key is not configured');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('API_KEY_MISSING');
  });
  
  it('should call next() with an error when API key is empty string', () => {
    // Set the API key to an empty string in the mocked config
    config.openai.apiKey = '';
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    
    // Get the error that was passed to next
    const error = next.mock.calls[0][0];
    
    // Check the error properties
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('OpenAI API key is not configured');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('API_KEY_MISSING');
  });
  
  it('should call next() with an error when API key is undefined', () => {
    // Set the API key to undefined in the mocked config
    config.openai.apiKey = undefined;
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    
    // Get the error that was passed to next
    const error = next.mock.calls[0][0];
    
    // Check the error properties
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('OpenAI API key is not configured');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('API_KEY_MISSING');
  });
});