/**
 * Integration tests for chat routes
 */

const request = require('supertest');
const express = require('express');
const chatRoutes = require('../../routes/chat-routes');
const { errorHandler } = require('../../middleware');

// Mock the services
jest.mock('../../services', () => ({
  chatService: {
    processMessage: jest.fn(),
    getChatHistory: jest.fn(),
    clearChatHistory: jest.fn()
  }
}));

const { chatService } = require('../../services');

describe('Chat Routes Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new Express app for each test
    app = express();
    
    // Add JSON middleware
    app.use(express.json());
    
    // Add chat routes
    app.use('/api/chat', chatRoutes);
    
    // Add error handler
    app.use(errorHandler);
    
    // Mock successful service responses
    chatService.processMessage.mockResolvedValue({
      userMessage: {
        id: 'user-msg-id',
        role: 'user',
        content: 'Hello, world!',
        timestamp: new Date().toISOString()
      },
      assistantMessage: {
        id: 'assistant-msg-id',
        role: 'assistant',
        content: 'Hi there! How can I help you?',
        timestamp: new Date().toISOString()
      }
    });
    
    chatService.getChatHistory.mockResolvedValue({
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Previous message',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Previous response',
          timestamp: new Date().toISOString()
        }
      ],
      hasMore: false
    });
    
    chatService.clearChatHistory.mockResolvedValue({ success: true });
  });
  
  describe('POST /api/chat/message', () => {
    it('should process a valid chat message and return a response', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          content: 'Hello, world!',
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the service was called with the request body
      expect(chatService.processMessage).toHaveBeenCalledWith({
        content: 'Hello, world!',
        images: []
      });
      
      // Check the response body
      expect(response.body).toEqual({
        userMessage: expect.objectContaining({
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello, world!'
        }),
        assistantMessage: expect.objectContaining({
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'Hi there! How can I help you?'
        })
      });
    });
    
    it('should return 400 for invalid request body', async () => {
      // Missing content field
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Check that the service was not called
      expect(chatService.processMessage).not.toHaveBeenCalled();
      
      // Check the error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Service error');
      serviceError.statusCode = 500;
      serviceError.code = 'SERVICE_ERROR';
      
      chatService.processMessage.mockRejectedValue(serviceError);
      
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          content: 'Hello, world!',
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('SERVICE_ERROR');
      expect(response.body.error.message).toBe('Service error');
    });
    
    it('should process a message with images', async () => {
      // Mock service response with images
      chatService.processMessage.mockResolvedValue({
        userMessage: {
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello with images',
          images: [
            { id: 'image-1', url: 'image-url-1' }
          ],
          timestamp: new Date().toISOString()
        },
        assistantMessage: {
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'I see you sent an image!',
          timestamp: new Date().toISOString()
        }
      });
      
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          content: 'Hello with images',
          images: [
            { id: 'image-1', data: 'base64-image-data' }
          ]
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the service was called with the images
      expect(chatService.processMessage).toHaveBeenCalledWith({
        content: 'Hello with images',
        images: [
          { id: 'image-1', data: 'base64-image-data' }
        ]
      });
      
      // Check the response body includes the images
      expect(response.body.userMessage.images).toEqual([
        { id: 'image-1', url: 'image-url-1' }
      ]);
    });
  });
  
  describe('GET /api/chat/history', () => {
    it('should return chat history', async () => {
      const response = await request(app)
        .get('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the service was called
      expect(chatService.getChatHistory).toHaveBeenCalledWith({});
      
      // Check the response body
      expect(response.body).toEqual({
        messages: [
          expect.objectContaining({
            id: 'msg-1',
            role: 'user',
            content: 'Previous message'
          }),
          expect.objectContaining({
            id: 'msg-2',
            role: 'assistant',
            content: 'Previous response'
          })
        ],
        hasMore: false
      });
    });
    
    it('should pass query parameters to the service', async () => {
      await request(app)
        .get('/api/chat/history?before=msg-id&limit=10')
        .expect(200);
      
      // Check that the service was called with the query parameters
      expect(chatService.getChatHistory).toHaveBeenCalledWith({
        before: 'msg-id',
        limit: '10'
      });
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('History service error');
      serviceError.statusCode = 500;
      serviceError.code = 'HISTORY_ERROR';
      
      chatService.getChatHistory.mockRejectedValue(serviceError);
      
      const response = await request(app)
        .get('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('HISTORY_ERROR');
      expect(response.body.error.message).toBe('History service error');
    });
  });
  
  describe('DELETE /api/chat/history', () => {
    it('should clear chat history', async () => {
      const response = await request(app)
        .delete('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the service was called
      expect(chatService.clearChatHistory).toHaveBeenCalled();
      
      // Check the response body
      expect(response.body).toEqual({ success: true });
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Clear history error');
      serviceError.statusCode = 500;
      serviceError.code = 'CLEAR_HISTORY_ERROR';
      
      chatService.clearChatHistory.mockRejectedValue(serviceError);
      
      const response = await request(app)
        .delete('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('CLEAR_HISTORY_ERROR');
      expect(response.body.error.message).toBe('Clear history error');
    });
  });
});