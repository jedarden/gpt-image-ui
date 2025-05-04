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
    
    // Process the message
    const response = await chatService.processMessage(validatedBody);
    
    // Send response
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  processMessage
};