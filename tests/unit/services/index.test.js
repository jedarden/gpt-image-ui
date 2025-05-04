/**
 * Tests for services index
 */

// Mock the service modules
jest.mock('../../../src/services/openai-service', () => 'openai-service-mock');
jest.mock('../../../src/services/chat-service', () => 'chat-service-mock');
jest.mock('../../../src/services/image-service', () => 'image-service-mock');

describe('Services Index', () => {
  let services;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the services index
    services = require('../../../src/services');
  });
  
  it('should export all required service modules', () => {
    // Check that all service modules are exported
    expect(services).toHaveProperty('openaiService');
    expect(services).toHaveProperty('chatService');
    expect(services).toHaveProperty('imageService');
  });
  
  it('should export the correct OpenAI service', () => {
    // Check that the openaiService property is the mock
    expect(services.openaiService).toBe('openai-service-mock');
  });
  
  it('should export the correct chat service', () => {
    // Check that the chatService property is the mock
    expect(services.chatService).toBe('chat-service-mock');
  });
  
  it('should export the correct image service', () => {
    // Check that the imageService property is the mock
    expect(services.imageService).toBe('image-service-mock');
  });
});