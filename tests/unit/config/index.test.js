/**
 * Tests for config index
 */

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config Index', () => {
  let config;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the config index
    config = require('../../../src/config');
  });
  
  it('should call dotenv.config()', () => {
    // Check that dotenv.config() was called
    const dotenv = require('dotenv');
    expect(dotenv.config).toHaveBeenCalled();
  });
  
  it('should export all required configuration objects', () => {
    // Check that all configuration objects are exported
    expect(config).toHaveProperty('server');
    expect(config).toHaveProperty('openai');
    expect(config).toHaveProperty('security');
  });
  
  it('should export objects for each configuration module', () => {
    // Check that each exported property is an object
    expect(typeof config.server).toBe('object');
    expect(typeof config.openai).toBe('object');
    expect(typeof config.security).toBe('object');
  });
  
  it('should export the correct server configuration properties', () => {
    // Check that the server object contains the expected properties
    expect(config.server).toHaveProperty('port');
    expect(config.server).toHaveProperty('basePath');
    expect(config.server).toHaveProperty('environment');
    expect(config.server).toHaveProperty('logging');
  });
  
  it('should export the correct OpenAI configuration properties', () => {
    // Check that the openai object contains the expected properties
    expect(config.openai).toHaveProperty('apiKey');
    expect(config.openai).toHaveProperty('model');
    expect(config.openai).toHaveProperty('defaults');
    expect(config.openai).toHaveProperty('retry');
  });
  
  it('should export the correct security configuration properties', () => {
    // Check that the security object contains the expected properties
    expect(config.security).toHaveProperty('cors');
    expect(config.security).toHaveProperty('rateLimit');
    expect(config.security).toHaveProperty('contentSecurityPolicy');
  });
});