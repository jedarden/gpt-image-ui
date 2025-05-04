/**
 * Tests for validate-api-key middleware
 */

// Mock the config module
jest.mock('../../../src/config', () => {
  return {
    openai: {
      apiKey: null // Will be set in individual tests
    }
  };
});

describe('Validate API Key Middleware', () => {
  let req, res, next, validateApiKey;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Mock Express request and response objects
    req = {};
    res = {};
    
    // Mock next function
    next = jest.fn();
  });
  
  it('should call next() when API key is configured', () => {
    // Set the API key in the mocked config before requiring the middleware
    const config = require('../../../src/config');
    config.openai.apiKey = 'test-api-key';
    
    // Require the middleware after setting the config
    const validateApiKey = require('../../../src/middleware/validate-api-key');
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called without an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
  
  it('should call next() with an error when API key is not configured', () => {
    // Ensure the API key is not set in the mocked config
    const config = require('../../../src/config');
    config.openai.apiKey = null;
    
    // Require the middleware after setting the config
    const validateApiKey = require('../../../src/middleware/validate-api-key');
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    
    // Get the error that was passed to next
    const error = next.mock.calls[0][0];
    
    // Check the error properties
    expect(error.message).toBe('OpenAI API key is not configured');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('API_KEY_MISSING');
  });
  
  it('should call next() with an error when API key is an empty string', () => {
    // Set the API key to an empty string in the mocked config
    const config = require('../../../src/config');
    config.openai.apiKey = '';
    
    // Require the middleware after setting the config
    const validateApiKey = require('../../../src/middleware/validate-api-key');
    
    // Call the middleware
    validateApiKey(req, res, next);
    
    // Check that next was called with an error
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    
    // Get the error that was passed to next
    const error = next.mock.calls[0][0];
    
    // Check the error properties
    expect(error.message).toBe('OpenAI API key is not configured');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('API_KEY_MISSING');
  });
});