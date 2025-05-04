const fs = require('fs');
const { fileToBase64, validateImageFile, createDataURL } = require('../image-processor');
const { BadRequestError } = require('../error');

// Mock fs module
jest.mock('fs', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
  promises: {
    readFile: jest.fn()
  }
}));

describe('Image Processor Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('fileToBase64', () => {
    it('should convert a file to base64', async () => {
      // Mock file data
      const mockFile = {
        path: '/tmp/test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      
      // Mock file content
      const mockBuffer = Buffer.from('test-image-content');
      
      // Mock fs.readFile to return the buffer
      fs.readFile.mockImplementation((path, callback) => {
        callback(null, mockBuffer);
      });
      
      // Call the function
      const result = await fileToBase64(mockFile);
      
      // Check that readFile was called with the correct path
      expect(fs.readFile).toHaveBeenCalledWith('/tmp/test-image.jpg', expect.any(Function));
      
      // Check that unlink was called to clean up the file
      expect(fs.unlink).toHaveBeenCalledWith('/tmp/test-image.jpg', expect.any(Function));
      
      // Check the result
      expect(result).toBe(mockBuffer.toString('base64'));
    });
    
    it('should throw BadRequestError if file processing fails', async () => {
      // Mock file data
      const mockFile = {
        path: '/tmp/test-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };
      
      // Mock fs.readFile to throw an error
      fs.readFile.mockImplementation((path, callback) => {
        callback(new Error('File read error'), null);
      });
      
      // Call the function and expect it to throw
      await expect(fileToBase64(mockFile)).rejects.toThrow(BadRequestError);
      
      // Check that the error has the correct properties
      try {
        await fileToBase64(mockFile);
      } catch (error) {
        expect(error.message).toBe('Failed to process image file');
        expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
      }
      
      // Check that unlink was not called
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
  
  describe('validateImageFile', () => {
    it('should validate a valid image file with default options', () => {
      // Mock file data
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      };
      
      // Call the function
      const result = validateImageFile(mockFile);
      
      // Check the result
      expect(result).toBe(true);
    });
    
    it('should validate a valid image file with custom options', () => {
      // Mock file data
      const mockFile = {
        mimetype: 'image/gif',
        size: 5 * 1024 * 1024 // 5MB
      };
      
      // Custom options
      const options = {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/gif', 'image/png']
      };
      
      // Call the function
      const result = validateImageFile(mockFile, options);
      
      // Check the result
      expect(result).toBe(true);
    });
    
    it('should throw BadRequestError if no file is provided', () => {
      // Call the function with null file and expect it to throw
      expect(() => validateImageFile(null)).toThrow(BadRequestError);
      
      // Check that the error has the correct properties
      try {
        validateImageFile(null);
      } catch (error) {
        expect(error.message).toBe('No image file provided');
        expect(error.code).toBe('FILE_MISSING');
      }
    });
    
    it('should throw BadRequestError if file is too large', () => {
      // Mock file data
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 30 * 1024 * 1024 // 30MB
      };
      
      // Call the function and expect it to throw
      expect(() => validateImageFile(mockFile)).toThrow(BadRequestError);
      
      // Check that the error has the correct properties
      try {
        validateImageFile(mockFile);
      } catch (error) {
        expect(error.message).toBe('File too large. Maximum size is 25MB');
        expect(error.code).toBe('FILE_TOO_LARGE');
      }
    });
    
    it('should throw BadRequestError if file type is not allowed', () => {
      // Mock file data
      const mockFile = {
        mimetype: 'image/gif',
        size: 1024 * 1024 // 1MB
      };
      
      // Call the function and expect it to throw
      expect(() => validateImageFile(mockFile)).toThrow(BadRequestError);
      
      // Check that the error has the correct properties
      try {
        validateImageFile(mockFile);
      } catch (error) {
        expect(error.message).toBe('Invalid file type. Allowed types: image/jpeg, image/png, image/webp');
        expect(error.code).toBe('INVALID_FILE_TYPE');
      }
    });
  });
  
  describe('createDataURL', () => {
    it('should create a data URL from base64 and MIME type', () => {
      // Test data
      const base64 = 'dGVzdC1pbWFnZS1jb250ZW50'; // base64 for "test-image-content"
      const mimeType = 'image/jpeg';
      
      // Call the function
      const result = createDataURL(base64, mimeType);
      
      // Check the result
      expect(result).toBe('data:image/jpeg;base64,dGVzdC1pbWFnZS1jb250ZW50');
    });
    
    it('should work with different MIME types', () => {
      // Test data
      const base64 = 'dGVzdC1pbWFnZS1jb250ZW50';
      const mimeType = 'image/png';
      
      // Call the function
      const result = createDataURL(base64, mimeType);
      
      // Check the result
      expect(result).toBe('data:image/png;base64,dGVzdC1pbWFnZS1jb250ZW50');
    });
  });
});