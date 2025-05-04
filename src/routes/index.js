/**
 * Routes index file
 * Exports all route modules
 */

const express = require('express');
const chatRoutes = require('./chat-routes');
const imageRoutes = require('./image-routes');

const router = express.Router();

// Mount routes
router.use('/chat', chatRoutes);
router.use('/', imageRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version,
    memory: process.memoryUsage(),
    openai: {
      model: process.env.OPENAI_API_MODEL || 'gpt-image-1',
      apiKeyConfigured: !!process.env.OPENAI_API_KEY
    }
  };
  res.status(200).json(healthInfo);
});

module.exports = router;