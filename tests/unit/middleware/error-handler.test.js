/**
 * Tests for error handler middleware
 */
const winston = require('winston');
const errorHandler = require('../../../src/middleware/error-handler');
const { ApiError } = require('../../../src/utils/error');

// Mock winston logger
jest.mock('winston', () => {
  const mLogger = {
    error: jest.fn()
  };
  return {
    createLogger: jest.fn(() => mLogger),
    format: {
      timestamp: jest.fn(() => 'timestamp-format'),
      json: jest.fn(() => 'json-format'),
      combine: jest.fn((...args) => args)
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  };
});

describe('Error Handler Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express request object
    req = {
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    
    // Mock Express response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock next function
    next = jest.fn();
  });
  
  it('should log the error and send a 500 response for generic errors', () => {
    // Create a generic error
    const error = new Error('Something went wrong');
    
    // Call the middleware
    errorHandler(error, req, res, next);
    
    // Check that the error was logged
    const logger = winston.createLogger();
    expect(logger.error).toHaveBeenCalledWith({
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    // Check that the response was sent with status 500
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR'
      }
    });
  });
  
  it('should include stack trace in development mode', () => {
    // Save original NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';
    
    // Create a generic error
    const error = new Error('Something went wrong');
    
    // Call the middleware
    errorHandler(error, req, res, next);
    
    // Check that the response includes the stack trace
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        stack: error.stack
      })
    }));
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
  
  it('should use the status code and message from ApiError', () => {
    // Create an ApiError with custom status code and message
    const error = new ApiError('Not Found', 404, 'RESOURCE_NOT_FOUND');
    
    // Call the middleware
    errorHandler(error, req, res, next);
    
    // Check that the response was sent with the custom status code and message
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Not Found',
        code: 'RESOURCE_NOT_FOUND'
      }
    });
  });
  
  it('should handle errors with custom status code but no code property', () => {
    // Create an error with custom status code but no code property
    const error = new Error('Bad Request');
    error.statusCode = 400;
    
    // Call the middleware
    errorHandler(error, req, res, next);
    
    // Check that the response was sent with the custom status code
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Bad Request',
        code: 'INTERNAL_ERROR'
      }
    });
  });
});