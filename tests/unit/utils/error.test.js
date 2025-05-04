/**
 * Tests for error utility
 */
const {
  ApiError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  OpenAIError
} = require('../../../src/utils/error');

describe('Error Utility', () => {
  describe('ApiError', () => {
    it('should create an ApiError with default values', () => {
      const error = new ApiError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.name).toBe('ApiError');
      expect(error.stack).toBeDefined();
    });
    
    it('should create an ApiError with custom values', () => {
      const error = new ApiError('Custom error', 418, 'IM_A_TEAPOT');
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe('IM_A_TEAPOT');
    });
  });
  
  describe('BadRequestError', () => {
    it('should create a BadRequestError with default values', () => {
      const error = new BadRequestError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.name).toBe('BadRequestError');
    });
    
    it('should create a BadRequestError with custom values', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT');
      
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_INPUT');
    });
  });
  
  describe('NotFoundError', () => {
    it('should create a NotFoundError with default values', () => {
      const error = new NotFoundError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Resource Not Found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });
    
    it('should create a NotFoundError with custom values', () => {
      const error = new NotFoundError('User not found', 'USER_NOT_FOUND');
      
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('USER_NOT_FOUND');
    });
  });
  
  describe('ValidationError', () => {
    it('should create a ValidationError with default values', () => {
      const error = new ValidationError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation Error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({});
      expect(error.name).toBe('ValidationError');
    });
    
    it('should create a ValidationError with custom values', () => {
      const details = {
        field: 'email',
        message: 'Invalid email format'
      };
      
      const error = new ValidationError('Invalid data', 'INVALID_DATA', details);
      
      expect(error.message).toBe('Invalid data');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_DATA');
      expect(error.details).toEqual(details);
    });
  });
  
  describe('OpenAIError', () => {
    it('should create an OpenAIError with default values', () => {
      const error = new OpenAIError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(OpenAIError);
      expect(error.message).toBe('OpenAI API Error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('OPENAI_ERROR');
      expect(error.originalError).toBeNull();
      expect(error.name).toBe('OpenAIError');
    });
    
    it('should create an OpenAIError with custom values', () => {
      const originalError = new Error('Original error');
      const error = new OpenAIError('API quota exceeded', 'QUOTA_EXCEEDED', originalError);
      
      expect(error.message).toBe('API quota exceeded');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('QUOTA_EXCEEDED');
      expect(error.originalError).toBe(originalError);
    });
  });
});