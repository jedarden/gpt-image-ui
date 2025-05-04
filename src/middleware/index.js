/**
 * Middleware index file
 * Exports all middleware components
 */

const errorHandler = require('./error-handler');
const requestLogger = require('./request-logger');
const validateApiKey = require('./validate-api-key');
const rateLimiter = require('./rate-limiter');

module.exports = {
  errorHandler,
  requestLogger,
  validateApiKey,
  rateLimiter
};