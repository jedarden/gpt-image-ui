/**
 * Test script for debug logging of OpenAI API payloads
 */

// Set environment variables
process.env.LOG_LEVEL = 'debug';
process.env.OPENAI_API_KEY = 'test_api_key';

// Import required modules
const openaiService = require('./src/services/openai-service');
const logger = require('./src/utils/logger');

// Mock OpenAI client to avoid actual API calls
const mockOpenAIClient = {
  chat: {
    completions: {
      create: async (params) => {
        return {
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'This is a test response'
              }
            }
          ]
        };
      }
    }
  }
};

// Set the mock client
openaiService.setOpenAIClient(mockOpenAIClient);

// Test function
async function testDebugLogging() {
  logger.info('Starting debug logging test');
  
  try {
    // Test chat completion
    await openaiService.createChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello, how are you?' }
      ],
      temperature: 0.7,
      quality: 'auto' // This should trigger the debug logging for the 'quality' parameter
    });
    
    logger.info('Test completed successfully');
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

// Run the test
testDebugLogging();