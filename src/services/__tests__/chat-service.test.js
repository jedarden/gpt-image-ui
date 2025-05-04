const { processMessage, isImageRequest } = require('../chat-service');
const openaiService = require('../openai-service');
const imageService = require('../image-service');
const { BadRequestError } = require('../../utils/error');

// Mock the openaiService
jest.mock('../openai-service', () => ({
  createChatCompletion: jest.fn()
}));

// Mock the imageService
jest.mock('../image-service', () => ({
  generateImages: jest.fn()
}));

describe('isImageRequest Function', () => {
  it('should identify explicit image requests', () => {
    expect(isImageRequest('draw a cat')).toBe(true);
    expect(isImageRequest('create an image of mountains')).toBe(true);
    expect(isImageRequest('show me a sunset')).toBe(true);
    expect(isImageRequest('generate a picture of a house')).toBe(true);
  });

  it('should identify implicit image requests', () => {
    expect(isImageRequest('a beautiful landscape')).toBe(true);
    expect(isImageRequest('fluffy rabbit')).toBe(true);
    expect(isImageRequest('imagine a futuristic city')).toBe(true);
  });

  it('should not identify regular questions as image requests', () => {
    expect(isImageRequest('what is the capital of France?')).toBe(false);
    expect(isImageRequest('how does photosynthesis work?')).toBe(false);
    expect(isImageRequest('tell me about quantum physics')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isImageRequest('')).toBe(false);
    expect(isImageRequest(null)).toBe(false);
    expect(isImageRequest(undefined)).toBe(false);
  });
});

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a text message successfully', async () => {
    // Mock the OpenAI response
    openaiService.createChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'This is a test response'
          }
        }
      ]
    });

    const result = await processMessage({ message: 'Hello, world!' });

    expect(result.assistantMessage).toHaveProperty('content', 'This is a test response');
    expect(result.assistantMessage).toHaveProperty('role', 'assistant');
    expect(result.assistantMessage).toHaveProperty('timestamp');
    expect(result.userMessage).toHaveProperty('content', 'Hello, world!');
    
    // Verify the messages sent to OpenAI
    expect(openaiService.createChatCompletion).toHaveBeenCalledWith({
      messages: [
        {
          role: 'system',
          content: expect.any(String)
        },
        {
          role: 'user',
          content: 'Hello, world!'
        }
      ]
    });
  });

  it('should process an image request and generate an image', async () => {
    // Mock the image service response
    imageService.generateImages.mockResolvedValue({
      images: [
        {
          id: 'test-image-id',
          base64: 'base64encodedimagedata'
        }
      ]
    });

    const result = await processMessage({ message: 'draw a cat' });

    // Verify image service was called
    expect(imageService.generateImages).toHaveBeenCalledWith({
      prompt: 'draw a cat',
      n: 1
    });

    // Verify the response format
    expect(result.assistantMessage).toHaveProperty('content', '');
    expect(result.assistantMessage).toHaveProperty('image');
    expect(result.assistantMessage.image).toHaveProperty('id', 'test-image-id');
    expect(result.assistantMessage.image).toHaveProperty('base64', 'base64encodedimagedata');
    expect(result.userMessage).toHaveProperty('content', 'draw a cat');
    
    // Verify OpenAI text completion was not called
    expect(openaiService.createChatCompletion).not.toHaveBeenCalled();
  });

  it('should process a message with images successfully', async () => {
    // Mock the OpenAI response
    openaiService.createChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'I see an image'
          }
        }
      ]
    });

    const result = await processMessage({
      message: 'What is in this image?',
      images: [
        { base64: 'base64encodedimage' }
      ]
    });

    expect(result.assistantMessage).toHaveProperty('content', 'I see an image');
    expect(result.userMessage).toHaveProperty('content', 'What is in this image?');
    
    // Verify the messages sent to OpenAI
    expect(openaiService.createChatCompletion).toHaveBeenCalledWith({
      messages: [
        {
          role: 'system',
          content: expect.any(String)
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image_url',
              image_url: {
                url: 'data:image/jpeg;base64,base64encodedimage'
              }
            }
          ]
        }
      ]
    });
  });

  it('should handle null message by converting to string', async () => {
    // Mock the OpenAI response
    openaiService.createChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'I received an empty message'
          }
        }
      ]
    });

    const result = await processMessage({
      message: null,
      images: [
        { base64: 'base64encodedimage' }
      ]
    });

    expect(result.assistantMessage).toHaveProperty('content', 'I received an empty message');
    expect(result.userMessage).toHaveProperty('content', 'null');
    
    // Verify the messages sent to OpenAI - should convert null to "null" string
    expect(openaiService.createChatCompletion).toHaveBeenCalledWith({
      messages: [
        {
          role: 'system',
          content: expect.any(String)
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'null' },
            {
              type: 'image_url',
              image_url: {
                url: 'data:image/jpeg;base64,base64encodedimage'
              }
            }
          ]
        }
      ]
    });
  });

  it('should throw an error for undefined message with no images', async () => {
    await expect(processMessage({ message: undefined }))
      .rejects
      .toThrow(BadRequestError);
  });

  it('should handle numeric message by converting to string', async () => {
    // Mock the OpenAI response
    openaiService.createChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'I received a number'
          }
        }
      ]
    });

    const result = await processMessage({ message: 123 });

    expect(result.assistantMessage).toHaveProperty('content', 'I received a number');
    expect(result.userMessage).toHaveProperty('content', '123');
    
    // Verify the messages sent to OpenAI - should convert number to string
    expect(openaiService.createChatCompletion).toHaveBeenCalledWith({
      messages: [
        {
          role: 'system',
          content: expect.any(String)
        },
        {
          role: 'user',
          content: '123'
        }
      ]
    });
  });

  it('should fall back to text response if image generation fails', async () => {
    // Mock the image service to fail
    imageService.generateImages.mockRejectedValue(new Error('Image generation failed'));
    
    // Mock the OpenAI response
    openaiService.createChatCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'I could not generate an image, here is a text response instead'
          }
        }
      ]
    });

    const result = await processMessage({ message: 'draw a cat' });

    // Verify image service was called
    expect(imageService.generateImages).toHaveBeenCalledWith({
      prompt: 'draw a cat',
      n: 1
    });

    // Verify fallback to text completion
    expect(openaiService.createChatCompletion).toHaveBeenCalled();
    expect(result.assistantMessage).toHaveProperty('content', 'I could not generate an image, here is a text response instead');
    expect(result.userMessage).toHaveProperty('content', 'draw a cat');
  });
});