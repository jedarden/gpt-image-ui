/**
 * Chat service
 * Handles chat-related operations
 */

const openaiService = require('./openai-service');
const { BadRequestError } = require('../utils/error');

/**
 * Process a chat message with optional images
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User message
 * @param {Array} params.images - Array of image objects (optional)
 * @returns {Promise<Object>} Chat response
 */
async function processMessage(params) {
  try {
    const { message, images = [] } = params;
    
    // Prepare messages array for OpenAI API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that can analyze images and respond to questions about them.'
      }
    ];
    
    // If there are images, create a message with text and image content
    if (images && images.length > 0) {
      const content = [
        { type: 'text', text: message }
      ];
      
      // Add each image to the content array
      images.forEach(image => {
        if (image.base64) {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image.base64}`
            }
          });
        }
      });
      
      messages.push({ role: 'user', content });
    } else {
      // If no images, just add the text message
      messages.push({ role: 'user', content: message });
    }
    
    // Call OpenAI API
    const response = await openaiService.createChatCompletion({ messages });
    
    // Extract and format the response
    const assistantMessage = response.choices[0].message;
    
    return {
      role: assistantMessage.role,
      content: assistantMessage.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error.name === 'OpenAIError') {
      throw error;
    }
    throw new BadRequestError('Failed to process chat message', 'CHAT_PROCESSING_ERROR');
  }
}

module.exports = {
  processMessage
};