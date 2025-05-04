/**
 * Tests for OpenAI service
 */

// Mock the OpenAI module
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        images: {
          generate: jest.fn(),
          edit: jest.fn()
        },
        chat: {
          completions: {
            create: jest.fn()
          }
        }
      };
    })
  };
});

// Mock the config
jest.mock('../../config', () => ({
  openai: {
    apiKey: 'test-api-key',
    model: 'dall-e-3',
    defaults: {
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      background: 'transparent'
    }
  }
}));

const { OpenAI } = require('openai');
const openaiService = require('../openai-service');
const { OpenAIError } = require('../../utils/error');

describe('OpenAI Service', () => {
  let openaiInstance;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get the mocked OpenAI instance
    openaiInstance = new OpenAI();
    
    // Mock successful responses
    openaiInstance.images.generate.mockResolvedValue({
      created: Date.now(),
      data: [
        { url: 'https://mock-image-url.com/image.png' }
      ]
    });
    
    openaiInstance.images.edit.mockResolvedValue({
      created: Date.now(),
      data: [
        { url: 'https://mock-image-url.com/edited-image.png' }
      ]
    });
    
    openaiInstance.chat.completions.create.mockResolvedValue({
      id: 'chatcmpl-mock-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4-vision-preview',
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'This is a mock response from the AI assistant.'
          },
          index: 0,
          finish_reason: 'stop'
        }
      ]
    });
  });
  
  describe('generateImages', () => {
    it('should generate images with default parameters', async () => {
      // Call the service
      const result = await openaiService.generateImages({
        prompt: 'A beautiful sunset'
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.images.generate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A beautiful sunset',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        background: 'transparent'
      });
      
      // Check the result
      expect(result).toEqual({
        created: expect.any(Number),
        data: [
          { url: 'https://mock-image-url.com/image.png' }
        ]
      });
    });
    
    it('should generate images with custom parameters', async () => {
      // Call the service with custom parameters
      const result = await openaiService.generateImages({
        prompt: 'A beautiful sunset',
        n: 2,
        size: '512x512',
        quality: 'hd',
        background: 'white'
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.images.generate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A beautiful sunset',
        n: 2,
        size: '512x512',
        quality: 'hd',
        background: 'white'
      });
      
      // Check the result
      expect(result).toEqual({
        created: expect.any(Number),
        data: [
          { url: 'https://mock-image-url.com/image.png' }
        ]
      });
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      const apiError = new Error('OpenAI API error');
      openaiInstance.images.generate.mockRejectedValue(apiError);
      
      // Call the service and expect it to throw
      await expect(openaiService.generateImages({
        prompt: 'A beautiful sunset'
      })).rejects.toThrow(OpenAIError);
      
      // Check that the error has the correct properties
      try {
        await openaiService.generateImages({
          prompt: 'A beautiful sunset'
        });
      } catch (error) {
        expect(error.message).toBe('OpenAI API error');
        expect(error.code).toBe('IMAGE_GENERATION_ERROR');
        expect(error.originalError).toBe(apiError);
      }
    });
  });
  
  describe('editImages', () => {
    it('should edit images with default parameters', async () => {
      // Call the service
      const result = await openaiService.editImages({
        image: 'base64-image-data',
        prompt: 'Add a dog to the image',
        mask: 'base64-mask-data'
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.images.edit).toHaveBeenCalledWith({
        model: 'dall-e-3',
        image: 'base64-image-data',
        prompt: 'Add a dog to the image',
        mask: 'base64-mask-data',
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      });
      
      // Check the result
      expect(result).toEqual({
        created: expect.any(Number),
        data: [
          { url: 'https://mock-image-url.com/edited-image.png' }
        ]
      });
    });
    
    it('should edit images with custom parameters', async () => {
      // Call the service with custom parameters
      const result = await openaiService.editImages({
        image: 'base64-image-data',
        prompt: 'Add a dog to the image',
        mask: 'base64-mask-data',
        n: 2,
        size: '512x512',
        quality: 'hd'
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.images.edit).toHaveBeenCalledWith({
        model: 'dall-e-3',
        image: 'base64-image-data',
        prompt: 'Add a dog to the image',
        mask: 'base64-mask-data',
        n: 2,
        size: '512x512',
        quality: 'hd'
      });
      
      // Check the result
      expect(result).toEqual({
        created: expect.any(Number),
        data: [
          { url: 'https://mock-image-url.com/edited-image.png' }
        ]
      });
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      const apiError = new Error('OpenAI API error');
      openaiInstance.images.edit.mockRejectedValue(apiError);
      
      // Call the service and expect it to throw
      await expect(openaiService.editImages({
        image: 'base64-image-data',
        prompt: 'Add a dog to the image'
      })).rejects.toThrow(OpenAIError);
      
      // Check that the error has the correct properties
      try {
        await openaiService.editImages({
          image: 'base64-image-data',
          prompt: 'Add a dog to the image'
        });
      } catch (error) {
        expect(error.message).toBe('OpenAI API error');
        expect(error.code).toBe('IMAGE_EDIT_ERROR');
        expect(error.originalError).toBe(apiError);
      }
    });
  });
  
  describe('createChatCompletion', () => {
    it('should create a chat completion with default parameters', async () => {
      // Call the service
      const result = await openaiService.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, world!' }
        ]
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-vision-preview',
        messages: [
          { role: 'user', content: 'Hello, world!' }
        ],
        max_tokens: 1000
      });
      
      // Check the result
      expect(result).toEqual({
        id: 'chatcmpl-mock-id',
        object: 'chat.completion',
        created: expect.any(Number),
        model: 'gpt-4-vision-preview',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'This is a mock response from the AI assistant.'
            },
            index: 0,
            finish_reason: 'stop'
          }
        ]
      });
    });
    
    it('should create a chat completion with custom parameters', async () => {
      // Call the service with custom parameters
      const result = await openaiService.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, world!' }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      // Check that the OpenAI API was called with the correct parameters
      expect(openaiInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-vision-preview',
        messages: [
          { role: 'user', content: 'Hello, world!' }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      // Check the result
      expect(result).toEqual({
        id: 'chatcmpl-mock-id',
        object: 'chat.completion',
        created: expect.any(Number),
        model: 'gpt-4-vision-preview',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'This is a mock response from the AI assistant.'
            },
            index: 0,
            finish_reason: 'stop'
          }
        ]
      });
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      const apiError = new Error('OpenAI API error');
      openaiInstance.chat.completions.create.mockRejectedValue(apiError);
      
      // Call the service and expect it to throw
      await expect(openaiService.createChatCompletion({
        messages: [
          { role: 'user', content: 'Hello, world!' }
        ]
      })).rejects.toThrow(OpenAIError);
      
      // Check that the error has the correct properties
      try {
        await openaiService.createChatCompletion({
          messages: [
            { role: 'user', content: 'Hello, world!' }
          ]
        });
      } catch (error) {
        expect(error.message).toBe('OpenAI API error');
        expect(error.code).toBe('CHAT_COMPLETION_ERROR');
        expect(error.originalError).toBe(apiError);
      }
    });
  });
});