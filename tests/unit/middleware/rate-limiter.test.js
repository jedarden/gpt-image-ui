/**
 * Tests for rate-limiter middleware
 */

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn(() => {
    return (req, res, next) => next();
  });
});

// Mock the config
jest.mock('../../../src/config', () => ({
  security: {
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100 // 100 requests per minute
    }
  }
}));

describe('Rate Limiter Middleware', () => {
  let rateLimit, rateLimiter;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.resetModules();
    
    // Import the mocked modules
    rateLimit = require('express-rate-limit');
    rateLimiter = require('../../../src/middleware/rate-limiter');
  });
  
  it('should create a rate limiter with the correct configuration', () => {
    // Check that express-rate-limit was called with the correct config
    expect(rateLimit).toHaveBeenCalledTimes(1);
    expect(rateLimit).toHaveBeenCalledWith({
      windowMs: 60000, // 1 minute
      max: 100, // 100 requests per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      }
    });
  });
  
  it('should use custom rate limit settings from environment variables', () => {
    // Save original process.env
    const originalEnv = process.env;
    
    // Set environment variables for rate limiting
    process.env.RATE_LIMIT_WINDOW_MS = '120000'; // 2 minutes
    process.env.RATE_LIMIT_MAX_REQUESTS = '50'; // 50 requests
    
    // Reset modules to reload with new env vars
    jest.resetModules();
    
    // Mock the config with the new env vars
    jest.mock('../../../src/config', () => ({
      security: {
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
        }
      }
    }));
    
    // Clear the require cache to force reload of the modules
    jest.resetModules();
    
    // Reimport the modules
    rateLimit = require('express-rate-limit');
    rateLimiter = require('../../../src/middleware/rate-limiter');
    
    // Check that express-rate-limit was called with the custom config
    expect(rateLimit).toHaveBeenCalledTimes(1);
    expect(rateLimit).toHaveBeenCalledWith(expect.objectContaining({
      windowMs: 120000, // 2 minutes
      max: 50 // 50 requests
    }));
    
    // Restore original process.env
    process.env = originalEnv;
  });
  
  it('should export a middleware function', () => {
    // The rateLimiter should be a function (middleware)
    expect(typeof rateLimiter).toBe('function');
  });
});