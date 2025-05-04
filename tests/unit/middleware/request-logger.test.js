/**
 * Tests for request-logger middleware
 */

// Mock morgan
jest.mock('morgan', () => {
  return jest.fn(() => {
    return (req, res, next) => next();
  });
});

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  };
  
  return {
    createLogger: jest.fn(() => mockLogger),
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

// Mock the config
jest.mock('../../../src/config', () => ({
  server: {
    logging: {
      format: 'dev',
      level: 'info'
    }
  }
}));

describe('Request Logger Middleware', () => {
  let morgan, winston, requestLogger, stream;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.resetModules();
    
    // Import the mocked modules
    morgan = require('morgan');
    winston = require('winston');
    
    // Import the middleware
    requestLogger = require('../../../src/middleware/request-logger');
    
    // Get the stream object from the middleware module
    const requestLoggerModule = jest.requireActual('../../../src/middleware/request-logger');
    stream = requestLoggerModule.stream;
  });
  
  it('should configure Winston logger with the correct options', () => {
    // Check that Winston createLogger was called with the correct config
    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    expect(winston.createLogger).toHaveBeenCalledWith({
      level: 'info',
      format: [
        'timestamp-format',
        'json-format'
      ],
      transports: [
        expect.any(winston.transports.Console),
        expect.any(winston.transports.File)
      ]
    });
    
    // Check that the File transport was configured correctly
    expect(winston.transports.File).toHaveBeenCalledWith({
      filename: 'access.log'
    });
  });
  
  it('should create Morgan middleware with the correct format and stream', () => {
    // Check that Morgan was called with the correct format and stream
    expect(morgan).toHaveBeenCalledTimes(1);
    expect(morgan).toHaveBeenCalledWith('dev', {
      stream: expect.objectContaining({
        write: expect.any(Function)
      })
    });
  });
  
  it('should use different Morgan format in production environment', () => {
    // Save original NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';
    
    // Mock the config for production
    jest.mock('../../../src/config', () => ({
      server: {
        logging: {
          format: 'combined',
          level: 'info'
        }
      }
    }));
    
    // Reset modules to reload with new env vars
    jest.resetModules();
    
    // Reimport the modules
    morgan = require('morgan');
    requestLogger = require('../../../src/middleware/request-logger');
    
    // Check that Morgan was called with the combined format
    expect(morgan).toHaveBeenCalledWith('combined', expect.any(Object));
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
  
  it('should export a middleware function', () => {
    // The requestLogger should be a function (middleware)
    expect(typeof requestLogger).toBe('function');
  });
});