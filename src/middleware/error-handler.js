/**
 * Error handling middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Use request-specific logger if available
  const log = req.logger || logger;
  
  // Log the error with context
  log.error('Request error', {
    error: {
      message: err.message,
      name: err.name,
      code: err.code || 'INTERNAL_ERROR',
      stack: err.stack
    },
    request: {
      id: req.id,
      path: req.path,
      method: req.method,
      ip: req.ip,
      headers: req.headers
    }
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    error: {
      message: statusCode === 500 ? 'Internal Server Error' : err.message,
      code: err.code || 'INTERNAL_ERROR'
    }
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;