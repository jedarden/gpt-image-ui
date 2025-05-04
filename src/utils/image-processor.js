/**
 * Image processing utilities
 */

const fs = require('fs');
const { promisify } = require('util');
const { BadRequestError } = require('./error');

// Promisify fs functions
const readFile = promisify(fs.readFile);

/**
 * Convert image file to base64
 * @param {Object} file - File object from multer
 * @returns {Promise<string>} Base64 encoded image
 */
async function fileToBase64(file) {
  try {
    const data = await readFile(file.path);
    const base64Image = data.toString('base64');
    
    // Clean up the temporary file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
    
    return base64Image;
  } catch (error) {
    throw new BadRequestError('Failed to process image file', 'IMAGE_PROCESSING_ERROR');
  }
}

/**
 * Validate image file
 * @param {Object} file - File object from multer
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {boolean} True if valid, throws error if invalid
 */
function validateImageFile(file, options = {}) {
  const maxSize = options.maxSize || 25 * 1024 * 1024; // 25MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!file) {
    throw new BadRequestError('No image file provided', 'FILE_MISSING');
  }
  
  if (file.size > maxSize) {
    throw new BadRequestError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`, 'FILE_TOO_LARGE');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 'INVALID_FILE_TYPE');
  }
  
  return true;
}

/**
 * Create a data URL from a base64 encoded image
 * @param {string} base64 - Base64 encoded image
 * @param {string} mimeType - MIME type of the image
 * @returns {string} Data URL
 */
function createDataURL(base64, mimeType) {
  return `data:${mimeType};base64,${base64}`;
}

module.exports = {
  fileToBase64,
  validateImageFile,
  createDataURL
};