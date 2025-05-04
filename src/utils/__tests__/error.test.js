const {
  ApiError,
  BadRequestError,
  NotFoundError,
  ValidationError,
  OpenAIError
} = require('../error');

describe('Error Utilities', () => {
  describe('ApiError', () => {
    it('should create an API error with default values', () => {
      const error = new ApiError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.stack).toBeDefined();
    });
    
    it('should create an API error with custom values', () => {
      const error = new ApiError('Custom error', 418, 'TEAPOT');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.code).toBe('TEAPOT');
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('BadRequestError', () => {
    it('should create a bad request error with default values', () => {
      const error = new BadRequestError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.name).toBe('BadRequestError');
      expect(error.message).toBe('Bad Request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.stack).toBeDefined();
    });
    
    it('should create a bad request error with custom values', () => {
      const error = new BadRequestError('Invalid input', 'INVALID_INPUT');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.name).toBe('BadRequestError');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_INPUT');
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('NotFoundError', () => {
    it('should create a not found error with default values', () => {
      const error = new NotFoundError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource Not Found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.stack).toBeDefined();
    });
    
    it('should create a not found error with custom values', () => {
      const error = new NotFoundError('User not found', 'USER_NOT_FOUND');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('ValidationError', () => {
    it('should create a validation error with default values', () => {
      const error = new ValidationError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation Error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({});
      expect(error.stack).toBeDefined();
    });
    
    it('should create a validation error with custom values', () => {
      const details = {
        field1: 'Field 1 is required',
        field2: 'Field 2 must be a number'
      };
      
      const error = new ValidationError('Invalid form data', 'FORM_VALIDATION_ERROR', details);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid form data');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('FORM_VALIDATION_ERROR');
      expect(error.details).toEqual(details);
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('OpenAIError', () => {
    it('should create an OpenAI error with default values', () => {
      const error = new OpenAIError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(OpenAIError);
      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('OpenAI API Error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('OPENAI_ERROR');
      expect(error.originalError).toBeNull();
      expect(error.stack).toBeDefined();
    });
    
    it('should create an OpenAI error with custom values', () => {
      const originalError = new Error('Rate limit exceeded');
      originalError.status = 429;
      
      const error = new OpenAIError('OpenAI rate limit exceeded', 'RATE_LIMIT_ERROR', originalError);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(OpenAIError);
      expect(error.name).toBe('OpenAIError');
      expect(error.message).toBe('OpenAI rate limit exceeded');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.originalError).toBe(originalError);
      expect(error.stack).toBeDefined();
    });
  });
  
  describe('Error inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const apiError = new ApiError('API error');
      const badRequestError = new BadRequestError('Bad request');
      const notFoundError = new NotFoundError('Not found');
      const validationError = new ValidationError('Validation error');
      const openAIError = new OpenAIError('OpenAI error');
      
      // Check instanceof relationships
      expect(badRequestError instanceof ApiError).toBe(true);
      expect(notFoundError instanceof ApiError).toBe(true);
      expect(validationError instanceof ApiError).toBe(true);
      expect(openAIError instanceof ApiError).toBe(true);
      
      // All should be instances of Error
      expect(apiError instanceof Error).toBe(true);
      expect(badRequestError instanceof Error).toBe(true);
      expect(notFoundError instanceof Error).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(openAIError instanceof Error).toBe(true);
    });
  });
});