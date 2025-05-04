/**
 * Test setup file
 * This file is run before each test file
 */

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Keep error for debugging
  error: jest.fn(),
  // Silence info and log in tests
  info: jest.fn(),
  log: jest.fn(),
  // Keep warn for debugging
  warn: jest.fn()
};

// Mock localStorage for frontend tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  });
}

// Add custom Jest matchers if needed
expect.extend({
  // Example custom matcher
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  }
});

// Global setup
beforeAll(() => {
  // Any setup that should run once before all tests
});

// Global teardown
afterAll(() => {
  // Any cleanup that should run once after all tests
});