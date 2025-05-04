/**
 * Image controller
 * Handles image-related HTTP requests
 */

const { imageService } = require('../services');
const { validators } = require('../utils');

/**
 * Upload an image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function uploadImage(req, res, next) {
  try {
    // Check if file exists
    if (!req.file) {
      const error = new Error('No image file uploaded');
      error.statusCode = 400;
      error.code = 'FILE_MISSING';
      throw error;
    }
    
    // Process the uploaded file
    const imageData = await imageService.processUpload(req.file);
    
    // Send response
    res.status(200).json(imageData);
  } catch (error) {
    next(error);
  }
}

/**
 * Generate images from a prompt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function generateImages(req, res, next) {
  try {
    // Validate request body
    const validatedBody = validators.validateGenerateRequest(req.body);
    
    // Generate images
    const response = await imageService.generateImages(validatedBody);
    
    // Send response
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Edit images with a prompt and mask
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function editImages(req, res, next) {
  try {
    // Validate request body
    const validatedBody = validators.validateEditRequest(req.body);
    
    // Edit images
    const response = await imageService.editImages(validatedBody);
    
    // Send response
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadImage,
  generateImages,
  editImages
};