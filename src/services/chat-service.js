/**
 * Chat service
 * Handles chat-related operations
 */

const openaiService = require('./openai-service');
const imageService = require('./image-service');
const { BadRequestError } = require('../utils/error');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Detects if a message is requesting an image generation
 * @param {string} message - User message
 * @returns {boolean} True if the message is requesting an image
 */
function isImageRequest(message) {
  if (!message) return false;
  
  // Convert to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  
  // Question patterns that indicate the user is NOT requesting an image
  const questionPatterns = [
    /^what is/i,
    /^how (do|does|can|could)/i,
    /^why (do|does|is|are)/i,
    /^when (do|does|is|are)/i,
    /^where (do|does|is|are)/i,
    /^who (is|are|was|were)/i,
    /^tell me about/i,
    /^explain/i,
    /\?$/  // Ends with a question mark and doesn't contain explicit image keywords
  ];
  
  // Explicit image request keywords
  const explicitImageKeywords = [
    'draw', 'create', 'generate', 'show me', 'picture of', 'image of', 'photo of',
    'illustration of', 'sketch of', 'painting of', 'render', 'visualize', 'design'
  ];
  
  // Check for explicit image request keywords
  for (const keyword of explicitImageKeywords) {
    if (lowerMessage.includes(keyword)) {
      return true;
    }
  }
  
  // If it matches a question pattern and doesn't have explicit image keywords, it's likely not an image request
  for (const pattern of questionPatterns) {
    if (pattern.test(lowerMessage)) {
      // Check if it also contains an explicit image keyword
      const containsImageKeyword = explicitImageKeywords.some(keyword => lowerMessage.includes(keyword));
      if (!containsImageKeyword) {
        return false;
      }
    }
  }
  
  // Check for descriptive phrases that imply an image request
  // These are patterns that often indicate someone is describing something visual
  const descriptivePatterns = [
    /a (\w+ ){0,3}(scene|landscape|portrait|picture)/i,
    /an? (\w+ ){0,3}(looking|appearing)/i,
    /imagine/i,
    /what (would|does) .* look like/i
  ];
  
  for (const pattern of descriptivePatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  // If the message is short (less than 6 words) and contains descriptive adjectives,
  // it's likely a simple image request
  const wordCount = message.split(/\s+/).length;
  if (wordCount < 6) {
    const descriptiveAdjectives = [
      'beautiful', 'colorful', 'red', 'blue', 'green', 'yellow', 'purple',
      'orange', 'black', 'white', 'large', 'small', 'tiny', 'huge', 'fluffy'
    ];
    
    for (const adj of descriptiveAdjectives) {
      // Make sure we're matching whole words, not parts of words
      const adjRegex = new RegExp(`\\b${adj}\\b`, 'i');
      if (adjRegex.test(lowerMessage)) {
        return true;
      }
    }
  }
  
  return false;
}

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
    
    // Validate message
    if ((message === null || message === undefined) && (!images || images.length === 0)) {
      throw new BadRequestError('Message cannot be null or undefined when no images are provided', 'INVALID_MESSAGE');
    }
    
    // Ensure message is a string
    const messageText = String(message);
    
    // Create a unique ID for the messages
    const timestamp = new Date().toISOString();
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    
    // Format the user message
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: messageText,
      timestamp: timestamp,
      status: 'SENT'
    };
    
    // Check if this is an image request and there are no uploaded images
    if (isImageRequest(messageText) && images.length === 0) {
      try {
        // Generate an image instead of text response
        const imageResponse = await imageService.generateImages({
          prompt: messageText,
          n: 1
        });
        
        // Format the response with the generated image
        if (imageResponse && imageResponse.images && imageResponse.images.length > 0) {
          const generatedImage = imageResponse.images[0];
          
          // Log the image data for debugging
          logger.debug('Generated image data:', {
            id: generatedImage.id,
            hasBase64: !!generatedImage.base64,
            base64Length: generatedImage.base64 ? generatedImage.base64.length : 0
          });
          
          return {
            userMessage,
            assistantMessage: {
              id: assistantMessageId,
              role: 'assistant',
              content: 'Here\'s the image you requested:', // Add descriptive text content
              images: [{
                id: generatedImage.id,
                url: `data:image/jpeg;base64,${generatedImage.base64}`,
                alt: 'Generated image based on your request'
              }],
              timestamp: timestamp,
              status: 'RECEIVED'
            }
          };
        }
      } catch (error) {
        // Log the error but continue with text response as fallback
        logger.error('Image generation failed, falling back to text response:', error);
        // We'll continue with the text response flow below
      }
    }
    
    // If not an image request or image generation failed, proceed with text response
    
    // Prepare messages array for OpenAI API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that can analyze images and respond to questions. You are powered by the gpt-4.1-nano model for text chat, while image generation is handled by the gpt-image-1 model. Provide comprehensive, helpful answers based on the user\'s query and any images they\'ve shared. If the user is asking for an image to be created, explain that you will use gpt-image-1 to generate it.'
      }
    ];
    
    // If there are images, create a message with text and image content
    if (images && images.length > 0) {
      const content = [
        { type: 'text', text: messageText }
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
      messages.push({ role: 'user', content: messageText });
    }
    
    // Use the prompt analysis model (gpt-4.1-nano) for text chat
    // gpt-image-1 is only for image generation, not text chat
    const response = await openaiService.createChatCompletion({
      messages,
      model: config.openai.promptAnalysisModel // Use the prompt analysis model for text chat
    });
    
    // Extract and format the response
    const assistantResponse = response.choices[0].message;
    
    // Format the response to match client expectations
    return {
      userMessage,
      assistantMessage: {
        id: assistantMessageId,
        role: assistantResponse.role,
        content: assistantResponse.content,
        timestamp: timestamp,
        status: 'RECEIVED'
      }
    };
  } catch (error) {
    if (error.name === 'OpenAIError') {
      throw error;
    }
    throw new BadRequestError('Failed to process chat message', 'CHAT_PROCESSING_ERROR');
  }
}

module.exports = {
  processMessage,
  isImageRequest
};