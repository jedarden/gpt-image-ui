/**
 * Image service
 * Handles image-related operations
 */

const openaiService = require('./openai-service');
const { imageProcessor } = require('../utils');
const { BadRequestError } = require('../utils/error');

/**
 * Process and store an uploaded image
 * @param {Object} file - Uploaded file from multer
 * @returns {Promise<Object>} Processed image data
 */
async function processUpload(file) {
  try {
    // Validate the image file
    imageProcessor.validateImageFile(file);
    
    // Convert file to base64
    const base64Image = await imageProcessor.fileToBase64(file);
    
    // Generate a unique ID for the image
    const id = generateImageId();
    
    // Return image data
    return {
      id,
      base64: base64Image,
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error.name === 'BadRequestError') {
      throw error;
    }
    throw new BadRequestError('Failed to process uploaded image', 'IMAGE_UPLOAD_ERROR');
  }
}

/**
 * Generate images from a prompt
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt
 * @param {number} params.n - Number of images to generate
 * @param {string} params.size - Image size (optional, will be determined by AI if not provided)
 * @param {string} params.quality - Image quality (optional, will be determined by AI if not provided)
 * @param {string} params.background - Background type (optional, will be determined by AI if not provided)
 * @returns {Promise<Object>} Generated images
 */
async function generateImages(params) {
  try {
    // Create a copy of the parameters to avoid modifying the original
    const enhancedParams = { ...params };
    
    // Only analyze the prompt if size, quality, or background are not explicitly provided
    const shouldAnalyzePrompt = !params.size || !params.quality || !params.background;
    
    if (shouldAnalyzePrompt && params.prompt) {
      try {
        // Analyze the prompt to determine optimal parameters
        const optimizedParams = await openaiService.analyzePromptForImageGeneration(params.prompt);
        
        // Only apply AI-determined parameters if they weren't explicitly provided by the user
        if (!params.size) enhancedParams.size = optimizedParams.size;
        if (!params.quality) enhancedParams.quality = optimizedParams.quality;
        if (!params.background) enhancedParams.background = optimizedParams.background;
      } catch (analysisError) {
        // If analysis fails, continue with user-provided or default parameters
        console.error('Prompt analysis failed, using default parameters:', analysisError);
      }
    }
    
    // Call OpenAI API with enhanced parameters
    const response = await openaiService.generateImages(enhancedParams);
    
    // Process and format the response
    const images = response.data.map(image => {
      const id = generateImageId();
      return {
        id,
        base64: image.b64_json,
        timestamp: new Date().toISOString()
      };
    });
    
    return {
      images,
      usage: response.usage
    };
  } catch (error) {
    if (error.name === 'OpenAIError') {
      throw error;
    }
    throw new BadRequestError('Failed to generate images', 'IMAGE_GENERATION_ERROR');
  }
}

/**
 * Edit images with a prompt and mask
 * @param {Object} params - Edit parameters
 * @param {string} params.image - Base64 encoded image or image ID
 * @param {string} params.prompt - Text prompt
 * @param {string} params.mask - Base64 encoded mask (optional)
 * @param {number} params.n - Number of images to generate
 * @param {string} params.size - Image size (optional, will be determined by AI if not provided)
 * @param {string} params.quality - Image quality (optional, will be determined by AI if not provided)
 * @returns {Promise<Object>} Edited images
 */
async function editImages(params) {
  try {
    // Create a copy of the parameters to avoid modifying the original
    const enhancedParams = { ...params };
    
    // Only analyze the prompt if size or quality are not explicitly provided
    const shouldAnalyzePrompt = !params.size || !params.quality;
    
    if (shouldAnalyzePrompt && params.prompt) {
      try {
        // Analyze the prompt to determine optimal parameters
        const optimizedParams = await openaiService.analyzePromptForImageGeneration(params.prompt);
        
        // Only apply AI-determined parameters if they weren't explicitly provided by the user
        if (!params.size) enhancedParams.size = optimizedParams.size;
        if (!params.quality) enhancedParams.quality = optimizedParams.quality;
        // Note: background parameter is not used in editImages API
      } catch (analysisError) {
        // If analysis fails, continue with user-provided or default parameters
        console.error('Prompt analysis failed, using default parameters:', analysisError);
      }
    }
    
    // If image is an array of base64 strings, use it directly
    // Otherwise, it should be a single base64 string
    if (!Array.isArray(enhancedParams.image) && typeof enhancedParams.image === 'string') {
      enhancedParams.image = [enhancedParams.image];
    }
    
    // Call OpenAI API with enhanced parameters
    const response = await openaiService.editImages(enhancedParams);
    
    // Process and format the response
    const images = response.data.map(image => {
      const id = generateImageId();
      return {
        id,
        base64: image.b64_json,
        timestamp: new Date().toISOString()
      };
    });
    
    return {
      images,
      usage: response.usage
    };
  } catch (error) {
    if (error.name === 'OpenAIError') {
      throw error;
    }
    throw new BadRequestError('Failed to edit images', 'IMAGE_EDIT_ERROR');
  }
}

/**
 * Generate a unique ID for an image
 * @returns {string} Unique ID
 */
function generateImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

module.exports = {
  processUpload,
  generateImages,
  editImages
};