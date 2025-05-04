/**
 * Server configuration
 */

module.exports = {
  port: process.env.PORT || 3001,
  basePath: process.env.BASE_PATH || '/api',
  environment: process.env.NODE_ENV || 'development',
  
  // Logging configuration
  logging: {
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Path configuration for subpath deployment
  subPath: process.env.SUB_PATH || ''
};