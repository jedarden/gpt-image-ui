/**
 * OpenAI API service
 * Handles communication with the OpenAI API
 */

const { OpenAI } = require('openai');
const config = require('../config').openai;
const { OpenAIError } = require('../utils/error');
const logger = require('../utils/logger');

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
      You are an AI assistant that analyzes image generation prompts to determine optimal parameters.
      Based on the prompt content, suggest the best parameters for:
      1. size (1024x1024, 1024x1792, 1792x1024) - choose based on whether the content would benefit from portrait, landscape, or square format
      2. quality (standard, hd) - choose hd for detailed images, standard for simpler ones
      3. background (auto, transparent) - choose transparent if the object would benefit from being isolated
      
      Respond with a JSON object containing only these parameters and no other text.
      Example: {"size": "1024x1024", "quality": "standard", "background": "auto"}
    `;

    // Call OpenAI API with the prompt analysis model
    const response = await openai.chat.completions.create({
      model: config.promptAnalysisModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Low temperature for more deterministic results
      max_tokens: 150
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const parameters = JSON.parse(content);

    // Validate the parameters
    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
    const validQualities = ['standard', 'hd'];
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

    // Call OpenAI API
    const response = await openai.images.generate(requestParams);
    
    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
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

    // Call OpenAI API
    const response = await openai.images.edit(requestParams);
    
    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
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

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview', // Use vision model for image understanding
      ...params,
      max_tokens: params.max_tokens || 1000
    });
    
    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
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
  analyzePromptForImageGeneration
};