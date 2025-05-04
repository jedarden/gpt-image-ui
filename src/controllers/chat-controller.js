/**
 * Chat controller
 * Handles chat-related HTTP requests
 */

const { chatService } = require('../services');
const { validators } = require('../utils');

/**
 * Process a chat message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function processMessage(req, res, next) {
  try {
    // Validate request body
    const validatedBody = validators.validateChatRequest(req.body);
    
    // Log the request for debugging (excluding large base64 data)
    const logBody = { ...validatedBody };
    if (logBody.images) {
      logBody.images = `[${logBody.images.length} images]`;
    }
    console.debug('Processing chat request:', logBody);
    
    // Process the message
    const response = await chatService.processMessage(validatedBody);
    
    // Send response
    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing chat message:', error.message);
    next(error);
  }
}

module.exports = {
  processMessage
};