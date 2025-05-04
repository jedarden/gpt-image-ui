/**
 * Tests for controllers index
 */

// Mock the controller modules
jest.mock('../../../src/controllers/chat-controller', () => 'chat-controller-mock');
jest.mock('../../../src/controllers/image-controller', () => 'image-controller-mock');

describe('Controllers Index', () => {
  let controllers;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the controllers index
    controllers = require('../../../src/controllers');
  });
  
  it('should export all required controller modules', () => {
    // Check that all controller modules are exported
    expect(controllers).toHaveProperty('chatController');
    expect(controllers).toHaveProperty('imageController');
  });
  
  it('should export the correct chat controller', () => {
    // Check that the chatController property is the mock
    expect(controllers.chatController).toBe('chat-controller-mock');
  });
  
  it('should export the correct image controller', () => {
    // Check that the imageController property is the mock
    expect(controllers.imageController).toBe('image-controller-mock');
  });
});