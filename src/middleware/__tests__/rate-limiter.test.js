/**
 * Tests for rate limiter middleware
 */

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    return {
      __options: options,
      __mockMiddleware: (req, res, next) => next()
    };
  });
});

// Mock config
jest.mock('../../config', () => ({
  security: {
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 100 // 100 requests per minute
    }
  }
}));

const rateLimit = require('express-rate-limit');
const config = require('../../config');
const rateLimiter = require('../rate-limiter');

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should create rate limiter with correct configuration', () => {
    // Check that express-rate-limit was called with the correct options
    expect(rateLimit).toHaveBeenCalledTimes(1);
    
    // Get the options passed to express-rate-limit
    const options = rateLimit.mock.calls[0][0];
    
    // Check the options
    expect(options.windowMs).toBe(config.security.rateLimit.windowMs);
    expect(options.max).toBe(config.security.rateLimit.max);
    expect(options.standardHeaders).toBe(true);
    expect(options.legacyHeaders).toBe(false);
    expect(options.message).toEqual({
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    });
  });
  
  it('should use the configured window and max values', () => {
    // Update the mock config values
    config.security.rateLimit.windowMs = 120000; // 2 minutes
    config.security.rateLimit.max = 50; // 50 requests per 2 minutes
    
    // Re-require the rate limiter to get a fresh instance with the new config
    jest.resetModules();
    const updatedRateLimiter = require('../rate-limiter');
    
    // Check that express-rate-limit was called with the updated options
    const latestCall = rateLimit.mock.calls[rateLimit.mock.calls.length - 1];
    const options = latestCall[0];
    
    // Check the options
    expect(options.windowMs).toBe(120000);
    expect(options.max).toBe(50);
  });
  
  it('should export a middleware function', () => {
    // Check that the exported value is a middleware function
    expect(rateLimiter).toBeDefined();
    expect(rateLimiter.__mockMiddleware).toBeDefined();
  });
  
  it('should handle different rate limit configurations', () => {
    // Test with different configurations
    const testConfigs = [
      { windowMs: 30000, max: 10 }, // 10 requests per 30 seconds
      { windowMs: 3600000, max: 1000 }, // 1000 requests per hour
      { windowMs: 86400000, max: 10000 } // 10000 requests per day
    ];
    
    testConfigs.forEach((testConfig, index) => {
      // Update the mock config
      config.security.rateLimit.windowMs = testConfig.windowMs;
      config.security.rateLimit.max = testConfig.max;
      
      // Re-require the rate limiter
      jest.resetModules();
      require('../rate-limiter');
      
      // Check the options
      const callIndex = rateLimit.mock.calls.length - 1;
      const options = rateLimit.mock.calls[callIndex][0];
      
      expect(options.windowMs).toBe(testConfig.windowMs);
      expect(options.max).toBe(testConfig.max);
    });
  });
});