const { 
  validateChatRequest, 
  validateGenerateRequest, 
  validateEditRequest 
} = require('../validators');
const { ValidationError } = require('../error');

describe('Validators', () => {
  describe('validateChatRequest', () => {
    it('should validate a valid chat request', () => {
      const validRequest = {
        message: 'Hello, world!',
        images: [{ id: 'image-1', url: 'image-1-url' }]
      };
      
      const result = validateChatRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should validate a chat request with no images', () => {
      const validRequest = {
        message: 'Hello, world!'
      };
      
      const result = validateChatRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should throw ValidationError if message is missing', () => {
      const invalidRequest = {
        images: [{ id: 'image-1', url: 'image-1-url' }]
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.message).toBe('Invalid chat request');
        expect(error.code).toBe('INVALID_CHAT_REQUEST');
        expect(error.details).toEqual({ message: 'Message is required' });
      }
    });
    
    it('should throw ValidationError if message is not a string', () => {
      const invalidRequest = {
        message: 123,
        images: [{ id: 'image-1', url: 'image-1-url' }]
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ message: 'Message must be a string' });
      }
    });
    
    it('should throw ValidationError if message is too long', () => {
      const invalidRequest = {
        message: 'a'.repeat(32001),
        images: [{ id: 'image-1', url: 'image-1-url' }]
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ message: 'Message exceeds maximum length of 32000 characters' });
      }
    });
    
    it('should throw ValidationError if images is not an array', () => {
      const invalidRequest = {
        message: 'Hello, world!',
        images: 'not-an-array'
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ images: 'Images must be an array' });
      }
    });
    
    it('should throw ValidationError if too many images', () => {
      const invalidRequest = {
        message: 'Hello, world!',
        images: Array(17).fill({ id: 'image-id', url: 'image-url' })
      };
      
      expect(() => validateChatRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateChatRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ images: 'Maximum of 16 images allowed' });
      }
    });
    
    it('should throw ValidationError with multiple errors', () => {
      const invalidRequest = {
        message: 123,
        images: 'not-an-array'
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
    it('should validate a valid generate request', () => {
      const validRequest = {
        prompt: 'A beautiful landscape',
        n: 2,
        size: '1024x1024',
        quality: 'high',
        background: 'transparent'
      };
      
      const result = validateGenerateRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should validate a generate request with only required fields', () => {
      const validRequest = {
        prompt: 'A beautiful landscape'
      };
      
      const result = validateGenerateRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should throw ValidationError if prompt is missing', () => {
      const invalidRequest = {
        n: 2,
        size: '1024x1024'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.message).toBe('Invalid image generation request');
        expect(error.code).toBe('INVALID_GENERATE_REQUEST');
        expect(error.details).toEqual({ prompt: 'Prompt is required' });
      }
    });
    
    it('should throw ValidationError if prompt is not a string', () => {
      const invalidRequest = {
        prompt: 123
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ prompt: 'Prompt must be a string' });
      }
    });
    
    it('should throw ValidationError if prompt is too long', () => {
      const invalidRequest = {
        prompt: 'a'.repeat(32001)
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ prompt: 'Prompt exceeds maximum length of 32000 characters' });
      }
    });
    
    it('should throw ValidationError if n is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful landscape',
        n: 20
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ n: 'n must be a number between 1 and 10' });
      }
    });
    
    it('should throw ValidationError if size is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful landscape',
        size: 'invalid-size'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto' });
      }
    });
    
    it('should throw ValidationError if quality is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful landscape',
        quality: 'invalid-quality'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ quality: 'Quality must be one of: high, medium, low, auto' });
      }
    });
    
    it('should throw ValidationError if background is invalid', () => {
      const invalidRequest = {
        prompt: 'A beautiful landscape',
        background: 'invalid-background'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ background: 'Background must be one of: transparent, opaque, auto' });
      }
    });
    
    it('should throw ValidationError with multiple errors', () => {
      const invalidRequest = {
        prompt: 123,
        n: 20,
        size: 'invalid-size'
      };
      
      expect(() => validateGenerateRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateGenerateRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          prompt: 'Prompt must be a string',
          n: 'n must be a number between 1 and 10',
          size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto'
        });
      }
    });
  });
  
  describe('validateEditRequest', () => {
    it('should validate a valid edit request', () => {
      const validRequest = {
        image: 'image-id',
        prompt: 'Add mountains in the background',
        mask: 'mask-data',
        n: 2,
        size: '1024x1024',
        quality: 'high'
      };
      
      const result = validateEditRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should validate an edit request with only required fields', () => {
      const validRequest = {
        image: 'image-id',
        prompt: 'Add mountains in the background'
      };
      
      const result = validateEditRequest(validRequest);
      
      // Should return the original request object
      expect(result).toBe(validRequest);
    });
    
    it('should throw ValidationError if image is missing', () => {
      const invalidRequest = {
        prompt: 'Add mountains in the background'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.message).toBe('Invalid image edit request');
        expect(error.code).toBe('INVALID_EDIT_REQUEST');
        expect(error.details).toEqual({ image: 'Image is required' });
      }
    });
    
    it('should throw ValidationError if prompt is missing', () => {
      const invalidRequest = {
        image: 'image-id'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ prompt: 'Prompt is required' });
      }
    });
    
    it('should throw ValidationError if prompt is not a string', () => {
      const invalidRequest = {
        image: 'image-id',
        prompt: 123
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ prompt: 'Prompt must be a string' });
      }
    });
    
    it('should throw ValidationError if prompt is too long', () => {
      const invalidRequest = {
        image: 'image-id',
        prompt: 'a'.repeat(32001)
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ prompt: 'Prompt exceeds maximum length of 32000 characters' });
      }
    });
    
    it('should throw ValidationError if n is invalid', () => {
      const invalidRequest = {
        image: 'image-id',
        prompt: 'Add mountains in the background',
        n: 20
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ n: 'n must be a number between 1 and 10' });
      }
    });
    
    it('should throw ValidationError if size is invalid', () => {
      const invalidRequest = {
        image: 'image-id',
        prompt: 'Add mountains in the background',
        size: 'invalid-size'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto' });
      }
    });
    
    it('should throw ValidationError if quality is invalid', () => {
      const invalidRequest = {
        image: 'image-id',
        prompt: 'Add mountains in the background',
        quality: 'invalid-quality'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({ quality: 'Quality must be one of: high, medium, low, auto' });
      }
    });
    
    it('should throw ValidationError with multiple errors', () => {
      const invalidRequest = {
        prompt: 123,
        n: 20,
        size: 'invalid-size'
      };
      
      expect(() => validateEditRequest(invalidRequest)).toThrow(ValidationError);
      
      try {
        validateEditRequest(invalidRequest);
      } catch (error) {
        expect(error.details).toEqual({
          image: 'Image is required',
          prompt: 'Prompt must be a string',
          n: 'n must be a number between 1 and 10',
          size: 'Size must be one of: 1024x1024, 1536x1024, 1024x1536, auto'
        });
      }
    });
  });
});