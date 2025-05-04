/**
 * Jest configuration for GPT Image UI backend
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns
  testMatch: [
    '**/src/**/__tests__/**/*.test.js',
    '**/src/tests/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/__tests__/**',
    '!src/tests/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.js'
  ],
  
  // Mock file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform files
  transform: {},
  
  // Verbose output
  verbose: true,
  
  // Environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Maximum number of workers
  maxWorkers: '50%',
  
  // Timeout for tests
  testTimeout: 30000,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Projects configuration for monorepo
  projects: [
    {
      displayName: 'backend',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.js',
        '<rootDir>/src/tests/**/*.test.js'
      ],
      testEnvironment: 'node'
    },
    {
      displayName: 'e2e',
      testMatch: [
        '<rootDir>/tests/e2e/**/*.test.js'
      ],
      testEnvironment: 'node'
    }
  ]
};