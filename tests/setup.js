/**
 * Jest setup file for GPT Image UI Backend tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.API_KEY = 'test-server-api-key';

// Global test timeout
jest.setTimeout(10000);

// Silence console logs during tests unless explicitly enabled
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    // Keep error for debugging
    error: console.error,
  };
}

// Clean up after all tests
afterAll(() => {
  // Add any cleanup needed after all tests run
});