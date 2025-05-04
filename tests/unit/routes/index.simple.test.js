/**
 * Simple tests for routes index
 */

// Mock dependencies
jest.mock('express', () => {
  const mockRouter = {
    use: jest.fn(),
    get: jest.fn()
  };
  return {
    Router: jest.fn(() => mockRouter)
  };
});

jest.mock('../../../src/routes/chat-routes', () => 'chat-routes-mock');
jest.mock('../../../src/routes/image-routes', () => 'image-routes-mock');

describe('Routes Index', () => {
  let express;
  let router;
  let routes;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import express
    express = require('express');
    
    // Create a new router
    router = express.Router();
    
    // Import the routes index
    routes = require('../../../src/routes');
  });
  
  it('should mount chat routes at /chat', () => {
    // Import the routes index
    require('../../../src/routes');
    
    // Check that router.use was called with the correct arguments
    expect(router.use).toHaveBeenCalledWith('/chat', 'chat-routes-mock');
  });
  
  it('should mount image routes at /', () => {
    // Import the routes index
    require('../../../src/routes');
    
    // Check that router.use was called with the correct arguments
    expect(router.use).toHaveBeenCalledWith('/', 'image-routes-mock');
  });
  
  it('should define a health check endpoint', () => {
    // Import the routes index
    require('../../../src/routes');
    
    // Check that router.get was called with the correct path
    expect(router.get).toHaveBeenCalledWith('/health', expect.any(Function));
  });
});