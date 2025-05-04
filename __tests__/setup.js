/**
 * Jest setup file for GPT Image UI backend tests
 * 
 * This file runs before each test file and sets up the test environment.
 */

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX = '100';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error for debugging
  error: jest.fn(),
  // Silence log and info in tests
  log: jest.fn(),
  info: jest.fn(),
  // Keep warn for debugging
  warn: jest.fn()
};

// Mock fs module for image processing tests
jest.mock('fs', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn()
  }
}));

// Mock axios for API tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock OpenAI API
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
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
            })
          }
        },
        images: {
          generate: jest.fn().mockResolvedValue({
            created: Date.now(),
            data: [
              {
                url: 'https://mock-image-url.com/image.png'
              }
            ]
          }),
          edit: jest.fn().mockResolvedValue({
            created: Date.now(),
            data: [
              {
                url: 'https://mock-image-url.com/edited-image.png'
              }
            ]
          })
        }
      };
    })
  };
});

// Global test cleanup
afterAll(() => {
  // Clean up any mocks or resources
  jest.clearAllMocks();
});