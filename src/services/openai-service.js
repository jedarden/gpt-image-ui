/**
 * OpenAI API service
 * Handles communication with the OpenAI API
 */

const { OpenAI } = require('openai');
const config = require('../config').openai;
const { OpenAIError } = require('../utils/error');
const logger = require('../utils/logger');

/**
 * Redacts sensitive information from an API payload
 * @param {Object} payload - The API payload to redact
 * @returns {Object} - The redacted payload
 */
function redactSensitiveInfo(payload) {
  // Create a deep copy of the payload to avoid modifying the original
  const redactedPayload = JSON.parse(JSON.stringify(payload));
  
  // Redact API key if present
  if (redactedPayload.apiKey) {
    redactedPayload.apiKey = '[REDACTED]';
  }
  
  // Redact authorization headers if present
  if (redactedPayload.headers && redactedPayload.headers.authorization) {
    redactedPayload.headers.authorization = '[REDACTED]';
  }
  
  return redactedPayload;
}

// Check if API key is valid
const isValidApiKey = config.apiKey && config.apiKey !== 'your_openai_api_key_here';

// Create OpenAI client if API key is valid
let openai;
if (isValidApiKey) {
  openai = new OpenAI({
    apiKey: config.apiKey
  });
} else {
  logger.warn('Invalid or missing OpenAI API key. API calls will fail.');
}

/**
 * Set the OpenAI client (for testing purposes)
 * @param {Object} client - OpenAI client
 */
function setOpenAIClient(client) {
  openai = client;
}

/**
 * Analyze a prompt using gpt-4.1-nano to determine optimal image generation parameters
 * @param {string} prompt - The user's image generation prompt
 * @returns {Promise<Object>} Optimized parameters for image generation
 */
async function analyzePromptForImageGeneration(prompt) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client is not initialized. Please provide a valid API key.');
    }

    // Create a system message that instructs the model how to analyze the prompt
    const systemMessage = `
      You are an expert on configuring the gpt-image-1 model for optimal image generation.
      Your specialty is analyzing prompts to determine the best parameters for the gpt-image-1 model.
      
      Based on the prompt content, suggest the optimal parameters for:
      1. size (1024x1024, 1024x1792, 1792x1024) - choose based on whether the content would benefit from portrait, landscape, or square format
      2. quality (low, medium, high, auto) - choose high for detailed images, medium for balanced quality, low for simpler ones
      3. background (auto, transparent) - choose transparent if the object would benefit from being isolated
      
      Consider the specific strengths of gpt-image-1 when making your recommendations:
      - It excels at photorealistic imagery when using "high" quality
      - It handles complex scenes better in larger dimensions
      - It produces cleaner object isolation with "transparent" background for single objects
      
      Respond with a JSON object containing only these parameters and no other text.
      Example: {"size": "1024x1024", "quality": "high", "background": "auto"}
    `;

    // Prepare API payload
    const payload = {
      model: config.promptAnalysisModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Low temperature for more deterministic results
      max_tokens: 150
    };
    
    // Log the API payload at debug level
    logger.debug('OpenAI API Payload (analyzePromptForImageGeneration):', redactSensitiveInfo(payload));
    
    // Call OpenAI API with the prompt analysis model
    const response = await openai.chat.completions.create(payload);

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const parameters = JSON.parse(content);

    // Validate the parameters
    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
    const validQualities = ['low', 'medium', 'high', 'auto']; // Updated valid qualities
    const validBackgrounds = ['auto', 'transparent'];

    // Apply defaults if parameters are invalid
    const validatedParams = {
      size: validSizes.includes(parameters.size) ? parameters.size : config.defaults.size,
      quality: validQualities.includes(parameters.quality) ? parameters.quality : config.defaults.quality,
      background: validBackgrounds.includes(parameters.background) ? parameters.background : config.defaults.background
    };

    logger.info(`Prompt analysis: "${prompt.substring(0, 30)}..." → Parameters: ${JSON.stringify(validatedParams)}`);
    return validatedParams;
  } catch (error) {
    logger.error('Error analyzing prompt:', error);
    // Return default parameters if analysis fails
    return {
      size: config.defaults.size,
      quality: config.defaults.quality,
      background: config.defaults.background
    };
  }
}

/**
 * Generate images from a prompt
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt
 * @param {number} params.n - Number of images to generate
 * @param {string} params.size - Image size
 * @param {string} params.quality - Image quality
 * @param {string} params.background - Background type
 * @returns {Promise<Object>} Generated images
 */
async function generateImages(params) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client is not initialized. Please provide a valid API key.');
    }

    // Merge default parameters with provided parameters
    const requestParams = {
      model: config.model,
      n: config.defaults.n,
      size: config.defaults.size,
      quality: config.defaults.quality,
      background: config.defaults.background,
      ...params
    };

    // Log the API payload at debug level
    logger.debug('OpenAI API Payload (generateImages):', redactSensitiveInfo(requestParams));

    // Call OpenAI API
    const response = await openai.images.generate(requestParams);
    
    return response;
  } catch (error) {
    logger.error('OpenAI API Error (generateImages):', error);
    throw new OpenAIError(
      error.message || 'Failed to generate images',
      'IMAGE_GENERATION_ERROR',
      error
    );
  }
}

/**
 * Edit images with a prompt and mask
 * @param {Object} params - Edit parameters
 * @param {string|Array} params.image - Base64 encoded image(s)
 * @param {string} params.prompt - Text prompt
 * @param {string} params.mask - Base64 encoded mask (optional)
 * @param {number} params.n - Number of images to generate
 * @param {string} params.size - Image size
 * @param {string} params.quality - Image quality
 * @returns {Promise<Object>} Edited images
 */
async function editImages(params) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client is not initialized. Please provide a valid API key.');
    }

    // Merge default parameters with provided parameters
    const requestParams = {
      model: config.model,
      n: config.defaults.n,
      size: config.defaults.size,
      quality: config.defaults.quality,
      ...params
    };

    // Log the API payload at debug level
    logger.debug('OpenAI API Payload (editImages):', redactSensitiveInfo(requestParams));

    // Call OpenAI API
    const response = await openai.images.edit(requestParams);
    
    return response;
  } catch (error) {
    logger.error('OpenAI API Error (editImages):', error);
    throw new OpenAIError(
      error.message || 'Failed to edit images',
      'IMAGE_EDIT_ERROR',
      error
    );
  }
}

/**
 * Send a chat message to the model
 * @param {Object} params - Chat parameters
 * @param {Array} params.messages - Chat messages
 * @returns {Promise<Object>} Chat completion
 */
async function createChatCompletion(params) {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client is not initialized. Please provide a valid API key.');
    }

    // Validate messages array
    if (!params.messages || !Array.isArray(params.messages)) {
      throw new Error('Messages must be an array');
    }

    // Validate each message in the array
    params.messages.forEach((message, index) => {
      if (!message.role) {
        throw new Error(`Message at index ${index} is missing a role`);
      }
      
      if (message.content === null || message.content === undefined) {
        throw new Error(`Message at index ${index} has null or undefined content`);
      }
      
      // For messages with array content (multimodal messages)
      if (Array.isArray(message.content)) {
        message.content.forEach((contentItem, contentIndex) => {
          if (contentItem.type === 'text' && (contentItem.text === null || contentItem.text === undefined)) {
            throw new Error(`Text content at index ${index}.${contentIndex} is null or undefined`);
          }
        });
      }
    });

    // Prepare API payload
    const payload = {
      model: params.model || config.model, // Use the model specified in params or default to config.model
      ...params,
      max_tokens: params.max_tokens || 1000
    };
    
    // Log the API payload at debug level
    logger.debug('OpenAI API Payload (createChatCompletion):', redactSensitiveInfo(payload));
    
    // Call OpenAI API
    const response = await openai.chat.completions.create(payload);
    
    return response;
  } catch (error) {
    logger.error('OpenAI API Error (createChatCompletion):', error);
    throw new OpenAIError(
      error.message || 'Failed to create chat completion',
      'CHAT_COMPLETION_ERROR',
      error
    );
  }
}

module.exports = {
  generateImages,
  editImages,
  createChatCompletion,
  analyzePromptForImageGeneration,
  setOpenAIClient
};