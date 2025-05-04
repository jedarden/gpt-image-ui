/**
 * Tests for validators utility
 */
const {
  validateChatRequest,
  validateGenerateRequest,
  validateEditRequest
} = require('../../../src/utils/validators');
const { ValidationError } = require('../../../src/utils/error');

describe('Validators Utility', () => {
  describe('validateChatRequest', () => {
    it('should validate a valid chat request', () => {
      const validRequest = {
        message: 'Hello, world!',
        images: ['image1.jpg', 'image2.jpg']
      };
      
      const result = validateChatRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should validate a chat request without images', () => {
      const validRequest = {
        message: 'Hello, world!'
      };
      
      const result = validateChatRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should throw ValidationError when message is missing', () => {
      const invalidRequest = {
        images: ['image1.jpg']
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      expect(() => validateChatRequest(invalidRequest)).toThrow('Invalid chat request');
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          message: 'Message is required'
        });
        expect(error.code).toBe('INVALID_CHAT_REQUEST');
      }
    });
    
    it('should throw ValidationError when message is not a string', () => {
      const invalidRequest = {
        message: 123,
        images: ['image1.jpg']
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          message: 'Message must be a string'
        });
      }
    });
    
    it('should throw ValidationError when message exceeds maximum length', () => {
      const invalidRequest = {
        message: 'a'.repeat(32001),
        images: ['image1.jpg']
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          message: 'Message exceeds maximum length of 32000 characters'
        });
      }
    });
    
    it('should throw ValidationError when images is not an array', () => {
      const invalidRequest = {
        message: 'Hello, world!',
        images: 'not an array'
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          images: 'Images must be an array'
        });
      }
    });
    
    it('should throw ValidationError when too many images are provided', () => {
      const invalidRequest = {
        message: 'Hello, world!',
        images: Array(17).fill('image.jpg')
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          images: 'Maximum of 16 images allowed'
        });
      }
    });
    
    it('should throw ValidationError with multiple errors', () => {
      const invalidRequest = {
        message: 123,
        images: 'not an array'
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          message: 'Message must be a string',
          images: 'Images must be an array'
        });
      }
    });
  });
  
  describe('validateGenerateRequest', () => {
    it('should validate a valid generate request with all fields', () => {
      const validRequest = {
        prompt: 'A beautiful sunset',
        n: 2,
        size: '1024x1024',
        quality: 'high',
        background: 'transparent'
      };
      
      const result = validateGenerateRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should validate a generate request with only required fields', () => {
      const validRequest = {
        prompt: 'A beautiful sunset'
      };
      
      const result = validateGenerateRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should throw ValidationError when prompt is missing', () => {
      const invalidRequest = {
        n: 2,
        size: '1024x1024'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt is required'
        });
        expect(error.code).toBe('INVALID_GENERATE_REQUEST');
      }
    });
    
    it('should throw ValidationError when prompt is not a string', () => {
      const invalidRequest = {
        prompt: 123
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt must be a string'
        });
      }
    });
    
    it('should throw ValidationError when prompt exceeds maximum length', () => {
      const invalidRequest = {
        prompt: 'a'.repeat(32001)
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt exceeds maximum length of 32000 characters'
        });
      }
    });
    
    it('should throw ValidationError when n is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful sunset',
        n: 20
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          n: 'n must be a number between 1 and 10'
        });
      }
    });
    
    it('should throw ValidationError when size is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful sunset',
        size: 'invalid-size'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto'
        });
      }
    });
    
    it('should throw ValidationError when quality is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful sunset',
        quality: 'invalid-quality'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          quality: 'Quality must be one of: high, medium, low, auto'
        });
      }
    });
    
    it('should throw ValidationError when background is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful sunset',
        background: 'invalid-background'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          background: 'Background must be one of: transparent, opaque, auto'
        });
      }
    });
  });
  
  describe('validateEditRequest', () => {
    it('should validate a valid edit request with all fields', () => {
      const validRequest = {
        image: 'base64-image-data',
        prompt: 'Make the sky more blue',
        n: 2,
        size: '1024x1024',
        quality: 'high'
      };
      
      const result = validateEditRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should validate an edit request with only required fields', () => {
      const validRequest = {
        image: 'base64-image-data',
        prompt: 'Make the sky more blue'
      };
      
      const result = validateEditRequest(validRequest);
      expect(result).toEqual(validRequest);
    });
    
    it('should throw ValidationError when image is missing', () => {
      const invalidRequest = {
        prompt: 'Make the sky more blue'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          image: 'Image is required'
        });
        expect(error.code).toBe('INVALID_EDIT_REQUEST');
      }
    });
    
    it('should throw ValidationError when prompt is missing', () => {
      const invalidRequest = {
        image: 'base64-image-data'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt is required'
        });
      }
    });
    
    it('should throw ValidationError when prompt is not a string', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 123
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt must be a string'
        });
      }
    });
    
    it('should throw ValidationError when prompt exceeds maximum length', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 'a'.repeat(32001)
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt exceeds maximum length of 32000 characters'
        });
      }
    });
    
    it('should throw ValidationError when n is invalid', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 'Make the sky more blue',
        n: 20
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          n: 'n must be a number between 1 and 10'
        });
      }
    });
    
    it('should throw ValidationError when size is invalid', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 'Make the sky more blue',
        size: 'invalid-size'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto'
        });
      }
    });
    
    it('should throw ValidationError when quality is invalid', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 'Make the sky more blue',
        quality: 'invalid-quality'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          quality: 'Quality must be one of: high, medium, low, auto'
        });
      }
    });
    
    it('should throw ValidationError with multiple errors', () => {
      const invalidRequest = {
        image: 'base64-image-data',
        prompt: 123,
        n: 20,
        size: 'invalid-size'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt must be a string',
          n: 'n must be a number between 1 and 10',
          size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto'
        });
      }
    });
  });
});