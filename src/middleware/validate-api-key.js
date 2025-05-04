/**
 * Middleware to validate OpenAI API key
 */

const config = require('../config').openai;
const logger = require('../utils/logger');

/**
 * Validates that the OpenAI API key is configured
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validateApiKey(req, res, next) {
  // Check if API key exists
  if (!config.apiKey) {
    const error = new Error('OpenAI API key is not configured');
    error.statusCode = 500;
    error.code = 'API_KEY_MISSING';
    return next(error);
  }

  // Check if API key is a placeholder
  if (config.apiKey === 'your_openai_api_key_here') {
    logger.warn('Using placeholder OpenAI API key. API calls will fail.');
    
    // For development mode, we'll allow the request to proceed with a warning
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    // In production, we'll block the request
    if (process.env.NODE_ENV === 'production') {
      const error = new Error('Invalid OpenAI API key. Please configure a valid API key.');
      error.statusCode = 500;
      error.code = 'API_KEY_INVALID';
      return next(error);
    }
  }

  // API key is valid, proceed to the next middleware
  next();
}

module.exports = validateApiKey;