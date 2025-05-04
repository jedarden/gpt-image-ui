/**
 * Image routes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { imageController } = require('../controllers');
const { validateApiKey } = require('../middleware');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

const router = express.Router();

/**
 * @route POST /api/images/upload
 * @description Upload an image
 * @access Public
 */
router.post('/images/upload', upload.single('image'), imageController.uploadImage);

/**
 * @route POST /api/images/generate
 * @description Generate images from a prompt
 * @access Public
 */
router.post('/images/generate', imageController.generateImages);

/**
 * @route POST /api/images/edit
 * @description Edit images with a prompt and mask
 * @access Public
 */
router.post('/images/edit', imageController.editImages);

/**
 * @route GET /api/images/:id
 * @description Get an image by ID
 * @access Public
 */
router.get('/images/:id', (req, res, next) => {
  try {
    const imageId = req.params.id;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const imagePath = path.join(uploadsDir, imageId);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      const error = new Error('Image not found');
      error.statusCode = 404;
      error.code = 'IMAGE_NOT_FOUND';
      throw error;
    }
    
    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    next(error);
  }
});

// Keep the original routes for backward compatibility
router.post('/upload', upload.single('image'), imageController.uploadImage);
router.post('/generate', imageController.generateImages);
router.post('/edit', imageController.editImages);

module.exports = router;