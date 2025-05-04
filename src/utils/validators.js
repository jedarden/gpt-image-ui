/**
 * Input validation utilities
 */

const { ValidationError } = require('./error');

/**
 * Validate chat message request
 * @param {Object} body - Request body
 * @returns {Object} Validated body
 */
function validateChatRequest(body) {
  const errors = {};
  
  // Validate message
  if (!body.message) {
    errors.message = 'Message is required';
  } else if (typeof body.message !== 'string') {
    errors.message = 'Message must be a string';
  } else if (body.message.length > 32000) {
    errors.message = 'Message exceeds maximum length of 32000 characters';
  }
  
  // Validate images if present
  if (body.images && !Array.isArray(body.images)) {
    errors.images = 'Images must be an array';
  } else if (body.images && body.images.length > 16) {
    errors.images = 'Maximum of 16 images allowed';
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid chat request', 'INVALID_CHAT_REQUEST', errors);
  }
  
  return body;
}

/**
 * Validate image generation request
 * @param {Object} body - Request body
 * @returns {Object} Validated body
 */
function validateGenerateRequest(body) {
  const errors = {};
  
  // Validate prompt
  if (!body.prompt) {
    errors.prompt = 'Prompt is required';
  } else if (typeof body.prompt !== 'string') {
    errors.prompt = 'Prompt must be a string';
  } else if (body.prompt.length > 32000) {
    errors.prompt = 'Prompt exceeds maximum length of 32000 characters';
  }
  
  // Validate n (number of images)
  if (body.n !== undefined) {
    if (typeof body.n !== 'number' || body.n < 1 || body.n > 10) {
      errors.n = 'n must be a number between 1 and 10';
    }
  }
  
  // Validate size
  const validSizes = ['1024x1024', '1536x1024', '1024x1536', 'auto'];
  if (body.size !== undefined && !validSizes.includes(body.size)) {
    errors.size = `Size must be one of: ${validSizes.join(', ')}`;
  }
  
  // Validate quality
  const validQualities = ['high', 'medium', 'low', 'auto'];
  if (body.quality !== undefined && !validQualities.includes(body.quality)) {
    errors.quality = `Quality must be one of: ${validQualities.join(', ')}`;
  }
  
  // Validate background
  const validBackgrounds = ['transparent', 'opaque', 'auto'];
  if (body.background !== undefined && !validBackgrounds.includes(body.background)) {
    errors.background = `Background must be one of: ${validBackgrounds.join(', ')}`;
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid image generation request', 'INVALID_GENERATE_REQUEST', errors);
  }
  
  return body;
}

/**
 * Validate image edit request
 * @param {Object} body - Request body
 * @returns {Object} Validated body
 */
function validateEditRequest(body) {
  const errors = {};
  
  // Validate image
  if (!body.image) {
    errors.image = 'Image is required';
  }
  
  // Validate prompt
  if (!body.prompt) {
    errors.prompt = 'Prompt is required';
  } else if (typeof body.prompt !== 'string') {
    errors.prompt = 'Prompt must be a string';
  } else if (body.prompt.length > 32000) {
    errors.prompt = 'Prompt exceeds maximum length of 32000 characters';
  }
  
  // Validate n (number of images)
  if (body.n !== undefined) {
    if (typeof body.n !== 'number' || body.n < 1 || body.n > 10) {
      errors.n = 'n must be a number between 1 and 10';
    }
  }
  
  // Validate size
  const validSizes = ['1024x1024', '1536x1024', '1024x1536', 'auto'];
  if (body.size !== undefined && !validSizes.includes(body.size)) {
    errors.size = `Size must be one of: ${validSizes.join(', ')}`;
  }
  
  // Validate quality
  const validQualities = ['high', 'medium', 'low', 'auto'];
  if (body.quality !== undefined && !validQualities.includes(body.quality)) {
    errors.quality = `Quality must be one of: ${validQualities.join(', ')}`;
  }
  
  // If there are validation errors, throw a ValidationError
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid image edit request', 'INVALID_EDIT_REQUEST', errors);
  }
  
  return body;
}

module.exports = {
  validateChatRequest,
  validateGenerateRequest,
  validateEditRequest
};