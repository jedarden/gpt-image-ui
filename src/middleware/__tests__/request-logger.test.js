const morgan = require('morgan');
const winston = require('winston');
const config = require('../../config').server;

// Mock morgan
jest.mock('morgan', () => jest.fn(() => 'mock-morgan-middleware'));

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    info: jest.fn()
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

// Mock config
jest.mock('../../config', () => ({
  server: {
    logging: {
      level: 'info',
      format: 'combined'
    }
  }
}));

describe('Request Logger Middleware', () => {
  let mockLogger;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mock logger
    mockLogger = winston.createLogger();
  });
  
  it('should create a Winston logger with the correct configuration', () => {
    // Import the request logger (this will execute the module code)
    const requestLogger = require('../request-logger');
    
    // Check that Winston createLogger was called with the correct options
    expect(winston.createLogger).toHaveBeenCalledWith({
      level: config.logging.level,
      format: [
        'timestamp-format',
        'json-format'
      ],
      transports: [
        expect.any(winston.transports.Console),
        expect.any(winston.transports.File)
      ]
    });
    
    // Check that the File transport was created with the correct filename
    expect(winston.transports.File).toHaveBeenCalledWith({
      filename: 'access.log'
    });
  });
  
  it('should create a Morgan middleware with the correct format and stream', () => {
    // Import the request logger (this will execute the module code)
    const requestLogger = require('../request-logger');
    
    // Check that Morgan was called with the correct format and stream
    expect(morgan).toHaveBeenCalledWith(config.logging.format, {
      stream: expect.objectContaining({
        write: expect.any(Function)
      })
    });
    
    // Check that the stream's write function logs to Winston
    const stream = morgan.mock.calls[0][1].stream;
    stream.write('Test log message\n');
    
    expect(mockLogger.info).toHaveBeenCalledWith('Test log message');
  });
  
  it('should return the Morgan middleware', () => {
    // Import the request logger
    const requestLogger = require('../request-logger');
    
    // Check that the Morgan middleware was returned
    expect(requestLogger).toBe('mock-morgan-middleware');
  });
  
  it('should use the configured logging level and format', () => {
    // Update the mock config values
    config.logging.level = 'debug';
    config.logging.format = 'dev';
    
    // Clear the module cache to force re-execution
    jest.resetModules();
    
    // Import the request logger again
    const requestLogger = require('../request-logger');
    
    // Check that Winston createLogger was called with the updated level
    expect(winston.createLogger).toHaveBeenCalledWith(expect.objectContaining({
      level: 'debug'
    }));
    
    // Check that Morgan was called with the updated format
    expect(morgan).toHaveBeenCalledWith('dev', expect.any(Object));
  });
});