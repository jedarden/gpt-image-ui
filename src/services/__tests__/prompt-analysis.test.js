/**
 * Tests for prompt analysis functionality
 */

const openaiService = require('../openai-service');
const config = require('../../config').openai;

// Mock the OpenAI client
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      size: '1024x1792',
                      quality: 'hd',
                      background: 'transparent'
                    })
                  }
                }
              ]
            })
          }
        }
      };
    })
  };
});

describe('Prompt Analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('analyzePromptForImageGeneration returns optimized parameters', async () => {
    // Test prompt
    const prompt = 'A tall, elegant vase with flowers against a white background';
    
    // Call the function
    const result = await openaiService.analyzePromptForImageGeneration(prompt);
    
    // Check the result
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('background');
    
    // Verify specific values from our mock
    expect(result.size).toBe('1024x1792');
    expect(result.quality).toBe('hd');
    expect(result.background).toBe('transparent');
  });

  test('analyzePromptForImageGeneration handles errors gracefully', async () => {
    // Mock implementation to throw an error
    const OpenAI = require('openai').OpenAI;
    OpenAI.mockImplementationOnce(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };
    });
    
    // Test prompt
    const prompt = 'A test prompt that will cause an error';
    
    // Call the function
    const result = await openaiService.analyzePromptForImageGeneration(prompt);
    
    // Should return default values on error
    expect(result.size).toBe(config.defaults.size);
    expect(result.quality).toBe(config.defaults.quality);
    expect(result.background).toBe(config.defaults.background);
  });

  test('analyzePromptForImageGeneration validates parameters', async () => {
    // Mock implementation to return invalid parameters
    const OpenAI = require('openai').OpenAI;
    OpenAI.mockImplementationOnce(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      size: 'invalid_size',
                      quality: 'invalid_quality',
                      background: 'invalid_background'
                    })
                  }
                }
              ]
            })
          }
        }
      };
    });
    
    // Test prompt
    const prompt = 'A test prompt with invalid parameters';
    
    // Call the function
    const result = await openaiService.analyzePromptForImageGeneration(prompt);
    
    // Should return default values for invalid parameters
    expect(result.size).toBe(config.defaults.size);
    expect(result.quality).toBe(config.defaults.quality);
    expect(result.background).toBe(config.defaults.background);
  });
});