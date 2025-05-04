/**
 * Tests for routes index
 */

// Mock the chat and image routes before requiring express
jest.mock('../../../src/routes/chat-routes', () => jest.fn());
jest.mock('../../../src/routes/image-routes', () => jest.fn());

const express = require('express');
const request = require('supertest');

describe('Routes Index', () => {
  let app;
  let chatRoutes;
  let imageRoutes;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Setup mock implementations
    chatRoutes = express.Router();
    chatRoutes.get('/test', (req, res) => {
      res.status(200).json({ route: 'chat' });
    });
    
    imageRoutes = express.Router();
    imageRoutes.get('/test', (req, res) => {
      res.status(200).json({ route: 'image' });
    });
    
    // Update the mocks
    require('../../../src/routes/chat-routes').mockImplementation(() => chatRoutes);
    require('../../../src/routes/image-routes').mockImplementation(() => imageRoutes);
    
    // Create a new Express app
    app = express();
    
    // Import the routes index
    const routes = require('../../../src/routes');
    
    // Mount the routes on the app
    app.use('/api', routes);
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  it('should mount chat routes correctly', async () => {
    const response = await request(app).get('/api/chat/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'chat' });
  });
  
  it('should mount image routes correctly', async () => {
    const response = await request(app).get('/api/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ route: 'image' });
  });
  
  it('should have a health check endpoint', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});