/**
 * Tests for utils index
 */

describe('Utils Index', () => {
  let utils;
  
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Import the utils index
    utils = require('../../../src/utils');
  });
  
  it('should export all required utility modules', () => {
    // Check that all utility modules are exported
    expect(utils).toHaveProperty('errors');
    expect(utils).toHaveProperty('imageProcessor');
    expect(utils).toHaveProperty('validators');
  });
  
  it('should export objects for each utility module', () => {
    // Check that each exported property is an object
    expect(typeof utils.errors).toBe('object');
    expect(typeof utils.imageProcessor).toBe('object');
    expect(typeof utils.validators).toBe('object');
  });
  
  it('should export the correct error utility functions', () => {
    // Check that the errors object contains the expected error classes
    expect(utils.errors).toHaveProperty('ApiError');
    expect(utils.errors).toHaveProperty('BadRequestError');
    expect(utils.errors).toHaveProperty('NotFoundError');
    expect(utils.errors).toHaveProperty('ValidationError');
    expect(utils.errors).toHaveProperty('OpenAIError');
  });
  
  it('should export the correct image processor utility functions', () => {
    // Check that the imageProcessor object contains the expected functions
    expect(utils.imageProcessor).toHaveProperty('fileToBase64');
    expect(utils.imageProcessor).toHaveProperty('validateImageFile');
    expect(utils.imageProcessor).toHaveProperty('createDataURL');
  });
  
  it('should export the correct validator utility functions', () => {
    // Check that the validators object contains the expected functions
    expect(utils.validators).toHaveProperty('validateChatRequest');
    expect(utils.validators).toHaveProperty('validateGenerateRequest');
    expect(utils.validators).toHaveProperty('validateEditRequest');
  });
});