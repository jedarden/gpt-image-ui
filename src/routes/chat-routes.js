/**
 * Chat routes
 */

const express = require('express');
const { chatController } = require('../controllers');
const { validateApiKey } = require('../middleware');

const router = express.Router();

/**
 * @route POST /api/chat/message
 * @description Process a chat message
 * @access Public
 */
router.post('/message', chatController.processMessage);

/**
 * @route GET /api/chat/history
 * @description Get chat history
 * @access Public
 */
router.get('/history', (req, res) => {
  // For now, return empty history since we don't have persistent storage
  res.status(200).json({
    messages: [],
    hasMore: false
  });
});

/**
 * @route DELETE /api/chat/history
 * @description Clear chat history
 * @access Public
 */
router.delete('/history', (req, res) => {
  // For now, just return success since we don't have persistent storage
  res.status(200).json({
    success: true,
    message: 'Chat history cleared'
  });
});

module.exports = router;