const request = require('supertest');
const express = require('express');
const { chatRoutes } = require('../../routes');
const { chatService } = require('../../services');
const { errorHandler } = require('../../middleware');
const { ValidationError } = require('../../utils/error');

// Mock the chat service
jest.mock('../../services', () => ({
  chatService: {
    processMessage: jest.fn()
  }
}));

describe('Chat API Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new Express app for each test
    app = express();
    
    // Configure middleware
    app.use(express.json());
    
    // Add chat routes
    app.use('/api/chat', chatRoutes);
    
    // Add error handler
    app.use(errorHandler);
  });
  
  describe('POST /api/chat/message', () => {
    it('should process a valid chat message and return a response', async () => {
      // Mock chat service response
      const mockResponse = {
        userMessage: {
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello, world!',
          timestamp: '2023-01-01T00:00:00.000Z'
        },
        assistantMessage: {
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'Hello! How can I help you?',
          timestamp: '2023-01-01T00:00:01.000Z'
        }
      };
      
      chatService.processMessage.mockResolvedValueOnce(mockResponse);
      
      // Send a request to the API
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello, world!',
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the chat service was called with the correct payload
      expect(chatService.processMessage).toHaveBeenCalledWith({
        message: 'Hello, world!',
        images: []
      });
      
      // Check the response body
      expect(response.body).toEqual(mockResponse);
    });
    
    it('should return a 400 error for invalid requests', async () => {
      // Mock validation error
      chatService.processMessage.mockImplementationOnce(() => {
        throw new ValidationError('Invalid chat request', 'INVALID_CHAT_REQUEST', {
          message: 'Message is required'
        });
      });
      
      // Send a request to the API
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Check the error response
      expect(response.body).toEqual({
        error: {
          message: 'Invalid chat request',
          code: 'INVALID_CHAT_REQUEST'
        }
      });
    });
    
    it('should return a 500 error for server errors', async () => {
      // Mock server error
      chatService.processMessage.mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });
      
      // Send a request to the API
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello, world!',
          images: []
        })
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toEqual({
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        }
      });
    });
    
    it('should process a chat message with images', async () => {
      // Mock chat service response
      const mockResponse = {
        userMessage: {
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello, world!',
          images: [
            { id: 'image-1', url: 'image-1-url' }
          ],
          timestamp: '2023-01-01T00:00:00.000Z'
        },
        assistantMessage: {
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'I see you sent an image. How can I help with it?',
          timestamp: '2023-01-01T00:00:01.000Z'
        }
      };
      
      chatService.processMessage.mockResolvedValueOnce(mockResponse);
      
      // Send a request to the API
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello, world!',
          images: [
            { id: 'image-1', url: 'image-1-url' }
          ]
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the chat service was called with the correct payload
      expect(chatService.processMessage).toHaveBeenCalledWith({
        message: 'Hello, world!',
        images: [
          { id: 'image-1', url: 'image-1-url' }
        ]
      });
      
      // Check the response body
      expect(response.body).toEqual(mockResponse);
    });
  });
  
  describe('GET /api/chat/history', () => {
    beforeEach(() => {
      // Add the mock method for chat history
      chatService.getChatHistory = jest.fn();
    });
    
    it('should return chat history', async () => {
      // Mock chat service response
      const mockResponse = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: '2023-01-01T00:00:00.000Z'
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hi there',
            timestamp: '2023-01-01T00:00:01.000Z'
          }
        ],
        hasMore: false
      };
      
      chatService.getChatHistory.mockResolvedValueOnce(mockResponse);
      
      // Send a request to the API
      const response = await request(app)
        .get('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the chat service was called
      expect(chatService.getChatHistory).toHaveBeenCalledWith(undefined);
      
      // Check the response body
      expect(response.body).toEqual(mockResponse);
    });
    
    it('should return chat history with pagination', async () => {
      // Mock chat service response
      const mockResponse = {
        messages: [
          {
            id: 'msg-3',
            role: 'user',
            content: 'How are you?',
            timestamp: '2022-12-31T00:00:00.000Z'
          },
          {
            id: 'msg-4',
            role: 'assistant',
            content: 'I am fine, thank you!',
            timestamp: '2022-12-31T00:00:01.000Z'
          }
        ],
        hasMore: true
      };
      
      chatService.getChatHistory.mockResolvedValueOnce(mockResponse);
      
      // Send a request to the API
      const response = await request(app)
        .get('/api/chat/history')
        .query({ before: 'msg-2' })
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the chat service was called with the correct parameters
      expect(chatService.getChatHistory).toHaveBeenCalledWith('msg-2');
      
      // Check the response body
      expect(response.body).toEqual(mockResponse);
    });
    
    it('should return a 500 error for server errors', async () => {
      // Mock server error
      chatService.getChatHistory.mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      // Send a request to the API
      const response = await request(app)
        .get('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toEqual({
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        }
      });
    });
  });
  
  describe('DELETE /api/chat/history', () => {
    beforeEach(() => {
      // Add the mock method for clearing chat history
      chatService.clearChatHistory = jest.fn();
    });
    
    it('should clear chat history', async () => {
      // Mock chat service response
      chatService.clearChatHistory.mockResolvedValueOnce({ success: true });
      
      // Send a request to the API
      const response = await request(app)
        .delete('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Check that the chat service was called
      expect(chatService.clearChatHistory).toHaveBeenCalled();
      
      // Check the response body
      expect(response.body).toEqual({ success: true });
    });
    
    it('should return a 500 error for server errors', async () => {
      // Mock server error
      chatService.clearChatHistory.mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      
      // Send a request to the API
      const response = await request(app)
        .delete('/api/chat/history')
        .expect('Content-Type', /json/)
        .expect(500);
      
      // Check the error response
      expect(response.body).toEqual({
        error: {
          message: 'Internal Server Error',
          code: 'INTERNAL_ERROR'
        }
      });
    });
  });
});