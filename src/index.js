/**
 * Main entry point for the GPT Image UI backend server
 */

// Set up global error handling for initialization errors
process.on('uncaughtException', (err) => {
  console.error('STARTUP ERROR: Server failed to initialize');
  console.error('Error details:', err.stack || err);
  process.exit(1);
});

try {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const fs = require('fs');
  const path = require('path');
  const logger = require('./utils/logger');
  const pkg = require('../package.json');

  // Load configuration
  const config = require('./config');
  const { server: serverConfig, security: securityConfig } = config;

  // Import middleware
  const middleware = require('./middleware');

  // Import routes
  const routes = require('./routes');

  // Create Express app
  const app = express();
  
  // Trust proxy for rate limiter to work properly with X-Forwarded-For headers
  app.set('trust proxy', 1);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info('Created uploads directory', { path: uploadsDir });
  }

  // Apply middleware
  app.use(middleware.requestLogger);
  app.use(helmet({
    contentSecurityPolicy: securityConfig.contentSecurityPolicy
  }));
  app.use(cors(securityConfig.cors));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(middleware.rateLimiter);

  // Mount API routes
  app.use(serverConfig.basePath, routes);

  // Serve static files from the React app in production
  if (serverConfig.environment === 'production') {
    const clientBuildPath = path.join(__dirname, '../client/build');
    
    // Check if the build directory exists
    if (fs.existsSync(clientBuildPath)) {
      logger.info('Serving React frontend from:', { path: clientBuildPath });
      
      // Serve static files with correct subpath
      const staticPath = serverConfig.subPath || '/';
      app.use(staticPath, express.static(clientBuildPath));
      
      // Handle React routing, return all requests to React app
      app.get(`${serverConfig.subPath}/*`, (req, res) => {
        // Skip API routes
        if (req.url.startsWith(serverConfig.basePath)) {
          return;
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    } else {
      logger.warn('React build directory not found', { path: clientBuildPath });
    }
  } else {
    // API info route for development
    app.get('/', (req, res) => {
      res.status(200).json({
        name: 'GPT Image UI API',
        version: pkg.version,
        description: 'Backend API for GPT Image UI application',
        endpoints: {
          base: serverConfig.basePath,
          chat: `${serverConfig.basePath}/chat`,
          upload: `${serverConfig.basePath}/upload`,
          generate: `${serverConfig.basePath}/generate`,
          edit: `${serverConfig.basePath}/edit`,
          health: `${serverConfig.basePath}/health`
        }
      });
    });
  }

  // Error handling middleware (must be last)
  app.use(middleware.errorHandler);

  // Start server
  const PORT = serverConfig.port;
  const server = app.listen(PORT, () => {
    logger.info(`Server started`, {
      port: PORT,
      basePath: serverConfig.basePath,
      environment: serverConfig.environment,
      version: pkg.version,
      nodeVersion: process.version
    });
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received, starting graceful shutdown`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection', { error: err.stack || err });
    // Don't exit the process in production, just log the error
    if (serverConfig.environment !== 'production') {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions during runtime (after initialization)
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.stack || err });
    // Always exit on uncaught exceptions
    process.exit(1);
  });
} catch (error) {
  console.error('INITIALIZATION ERROR: Failed to start server');
  console.error('Error details:', error.stack || error);
  process.exit(1);
}
