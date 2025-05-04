/**
 * Tests for error handler middleware
 */

// Mock winston logger
jest.mock('winston', () => {
  const mockLogger = {
    error: jest.fn()
  };
  
  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      json: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  };
});

const winston = require('winston');
const errorHandler = require('../error-handler');
const { BadRequestError } = require('../../utils/error');

describe('Error Handler Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express request, response, and next
    req = {
      path: '/api/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Save original NODE_ENV
    this.originalNodeEnv = process.env.NODE_ENV;
  });
  
  afterEach(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = this.originalNodeEnv;
  });
  
  it('should handle custom errors with correct status code', () => {
    // Create a custom error
    const error = new BadRequestError('Invalid input', 'VALIDATION_ERROR');
    
    // Call the error handler
    errorHandler(error, req, res, next);
    
    // Check that the logger was called with the correct info
    expect(winston.createLogger().error).toHaveBeenCalledWith({
      message: 'Invalid input',
      stack: error.stack,
      path: '/api/test',
      method: 'GET',
      ip: '127.0.0.1'
    });
    
    // Check that the response was sent with the correct status and body
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Invalid input',
        code: 'VALIDATION_ERROR'
      }
    });
  });
  
  it('should handle generic errors with 500 status code', () => {
    // Create a generic error
    const error = new Error('Something went wrong');
    
    // Call the error handler
    errorHandler(error, req, res, next);
    
    // Check that the logger was called with the correct info
    expect(winston.createLogger().error).toHaveBeenCalledWith({
      message: 'Something went wrong',
      stack: error.stack,
      path: '/api/test',
      method: 'GET',
      ip: '127.0.0.1'
    });
    
    // Check that the response was sent with the correct status and body
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR'
      }
    });
  });
  
  it('should include stack trace in development mode', () => {
    // Set NODE_ENV to development
    process.env.NODE_ENV = 'development';
    
    // Create an error
    const error = new Error('Development error');
    
    // Call the error handler
    errorHandler(error, req, res, next);
    
    // Check that the response includes the stack trace
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        stack: error.stack
      }
    });
  });
  
  it('should not include stack trace in production mode', () => {
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';
    
    // Create an error
    const error = new Error('Production error');
    
    // Call the error handler
    errorHandler(error, req, res, next);
    
    // Check that the response does not include the stack trace
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR'
      }
    });
    
    // Check that the stack property is not present
    expect(res.json.mock.calls[0][0].error.stack).toBeUndefined();
  });
  
  it('should use error code from the error object if available', () => {
    // Create an error with a custom code
    const error = new Error('Error with custom code');
    error.code = 'CUSTOM_ERROR_CODE';
    error.statusCode = 400;
    
    // Call the error handler
    errorHandler(error, req, res, next);
    
    // Check that the response uses the custom code
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: 'Error with custom code',
        code: 'CUSTOM_ERROR_CODE'
      }
    });
  });
});