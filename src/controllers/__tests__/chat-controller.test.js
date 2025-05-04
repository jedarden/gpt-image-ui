/**
 * Tests for chat controller
 */

// Mock the services and utils
jest.mock('../../services', () => ({
  chatService: {
    processMessage: jest.fn()
  }
}));

jest.mock('../../utils', () => ({
  validators: {
    validateChatRequest: jest.fn()
  }
}));

const { chatService } = require('../../services');
const { validators } = require('../../utils');
const chatController = require('../chat-controller');

describe('Chat Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Express request, response, and next
    req = {
      body: {
        content: 'Hello, world!',
        images: []
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock successful validation
    validators.validateChatRequest.mockImplementation((body) => body);
    
    // Mock successful service response
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
  });
  
  describe('processMessage', () => {
    it('should process a valid chat message and return a response', async () => {
      // Call the controller
      await chatController.processMessage(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateChatRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the service was called with the validated body
      expect(chatService.processMessage).toHaveBeenCalledWith(req.body);
      
      // Check that the response was sent with the correct status and body
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
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
      
      // Check that next was not called (no error)
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should handle validation errors', async () => {
      // Mock validation error
      const validationError = new Error('Invalid request');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      
      validators.validateChatRequest.mockImplementation(() => {
        throw validationError;
      });
      
      // Call the controller
      await chatController.processMessage(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateChatRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the service was not called
      expect(chatService.processMessage).not.toHaveBeenCalled();
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(validationError);
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Service error');
      serviceError.statusCode = 500;
      serviceError.code = 'SERVICE_ERROR';
      
      chatService.processMessage.mockRejectedValue(serviceError);
      
      // Call the controller
      await chatController.processMessage(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateChatRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the service was called with the validated body
      expect(chatService.processMessage).toHaveBeenCalledWith(req.body);
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(serviceError);
    });
    
    it('should process a message with images', async () => {
      // Update request with images
      req.body.images = [
        { id: 'image-1', data: 'base64-image-data-1' },
        { id: 'image-2', data: 'base64-image-data-2' }
      ];
      
      // Mock service response with images
      chatService.processMessage.mockResolvedValue({
        userMessage: {
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello, world!',
          images: [
            { id: 'image-1', url: 'image-url-1' },
            { id: 'image-2', url: 'image-url-2' }
          ],
          timestamp: new Date().toISOString()
        },
        assistantMessage: {
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'I see you sent some images!',
          timestamp: new Date().toISOString()
        }
      });
      
      // Call the controller
      await chatController.processMessage(req, res, next);
      
      // Check that the service was called with the request body including images
      expect(chatService.processMessage).toHaveBeenCalledWith({
        content: 'Hello, world!',
        images: [
          { id: 'image-1', data: 'base64-image-data-1' },
          { id: 'image-2', data: 'base64-image-data-2' }
        ]
      });
      
      // Check that the response includes the images
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: expect.objectContaining({
            images: [
              { id: 'image-1', url: 'image-url-1' },
              { id: 'image-2', url: 'image-url-2' }
            ]
          })
        })
      );
    });
  });
});