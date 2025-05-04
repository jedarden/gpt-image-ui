/**
 * Request logging middleware
 * Uses Morgan for HTTP request logging and integrates with the application logger
 */

const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const config = require('../config').server;
const logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by Morgan
const stream = {
  write: (message) => {
    logger.info(message.trim(), { component: 'http' });
  }
};

// Generate request ID and setup request context
const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Add request context to logger
const loggerContextMiddleware = logger.addRequestContext;

// Create Morgan middleware with the specified format and stream
const morganMiddleware = morgan(config.logging.format, { stream });

// Combine all middleware
const requestLogger = [
  requestIdMiddleware,
  loggerContextMiddleware,
  morganMiddleware
];

module.exports = requestLogger;