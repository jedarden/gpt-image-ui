/**
 * Tests for middleware index
 */

describe('Middleware Index', () => {
  let middleware;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the middleware index
    middleware = require('../../../src/middleware');
  });
  
  it('should export all required middleware functions', () => {
    // Check that all middleware functions are exported
    expect(middleware).toHaveProperty('errorHandler');
    expect(middleware).toHaveProperty('requestLogger');
    expect(middleware).toHaveProperty('validateApiKey');
    expect(middleware).toHaveProperty('rateLimiter');
  });
  
  it('should export functions for each middleware', () => {
    // Check that each exported property is a function
    expect(typeof middleware.errorHandler).toBe('function');
    expect(typeof middleware.requestLogger).toBe('function');
    expect(typeof middleware.validateApiKey).toBe('function');
    expect(typeof middleware.rateLimiter).toBe('function');
  });
});