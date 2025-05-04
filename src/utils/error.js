/**
 * Custom error classes
 */

/**
 * Base API Error class
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error
 */
class BadRequestError extends ApiError {
  /**
   * Create a new bad request error
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message = 'Bad Request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends ApiError {
  /**
   * Create a new not found error
   * @param {string} message - Error message
   * @param {string} code - Error code
   */
  constructor(message = 'Resource Not Found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

/**
 * Validation Error
 */
class ValidationError extends ApiError {
  /**
   * Create a new validation error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Validation error details
   */
  constructor(message = 'Validation Error', code = 'VALIDATION_ERROR', details = {}) {
    super(message, 400, code);
    this.details = details;
  }
}

/**
 * OpenAI API Error
 */
class OpenAIError extends ApiError {
  /**
   * Create a new OpenAI API error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} originalError - Original OpenAI error
   */
  constructor(message = 'OpenAI API Error', code = 'OPENAI_ERROR', originalError = null) {
    super(message, 500, code);
    this.originalError = originalError;
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  OpenAIError
};