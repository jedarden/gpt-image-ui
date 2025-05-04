/**
 * Tests for image processor utility
 */
const fs = require('fs');
const { BadRequestError } = require('../../../src/utils/error');
const {
  fileToBase64,
  validateImageFile,
  createDataURL
} = require('../../../src/utils/image-processor');

// Mock fs module
jest.mock('fs', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
  promises: {
    readFile: jest.fn()
  }
}));

describe('Image Processor Utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fileToBase64', () => {
    it('should convert a file to base64', async () => {
      // Mock file data
      const mockFile = {
        path: '/tmp/test-image.jpg',
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg'
      };
      
      // Mock file content as Buffer
      const mockBuffer = Buffer.from('test image content');
      
      // Mock fs.readFile to return the buffer
      fs.readFile.mockImplementation((path, callback) => {
        callback(null, mockBuffer);
      });
      
      const result = await fileToBase64(mockFile);
      
      // Check that readFile was called with the correct path
      expect(fs.readFile).toHaveBeenCalledWith(mockFile.path, expect.any(Function));
      
      // Check that unlink was called to clean up the file
      expect(fs.unlink).toHaveBeenCalledWith(mockFile.path, expect.any(Function));
      
      // Check that the result is the base64 encoded buffer
      expect(result).toBe(mockBuffer.toString('base64'));
    });
    
    it('should throw BadRequestError when file processing fails', async () => {
      // Mock file data
      const mockFile = {
        path: '/tmp/test-image.jpg',
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg'
      };
      
      // Mock fs.readFile to throw an error
      fs.readFile.mockImplementation((path, callback) => {
        callback(new Error('File read error'), null);
      });
      
      await expect(fileToBase64(mockFile)).rejects.toThrow(BadRequestError);
      await expect(fileToBase64(mockFile)).rejects.toThrow('Failed to process image file');
      
      // Check that readFile was called
      expect(fs.readFile).toHaveBeenCalled();
      
      // Check that unlink was not called since there was an error
      expect(fs.unlink).not.toHaveBeenCalled();
    });
  });
  
  describe('validateImageFile', () => {
    it('should validate a valid image file with default options', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        mimetype: 'image/jpeg'
      };
      
      expect(validateImageFile(mockFile)).toBe(true);
    });
    
    it('should validate a valid image file with custom options', () => {
      const mockFile = {
        size: 5 * 1024 * 1024, // 5MB
        mimetype: 'image/gif'
      };
      
      const options = {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/gif', 'image/jpeg']
      };
      
      expect(validateImageFile(mockFile, options)).toBe(true);
    });
    
    it('should throw BadRequestError when no file is provided', () => {
      expect(() => validateImageFile(null)).toThrow(BadRequestError);
      expect(() => validateImageFile(null)).toThrow('No image file provided');
    });
    
    it('should throw BadRequestError when file is too large', () => {
      const mockFile = {
        size: 30 * 1024 * 1024, // 30MB
        mimetype: 'image/jpeg'
      };
      
      expect(() => validateImageFile(mockFile)).toThrow(BadRequestError);
      expect(() => validateImageFile(mockFile)).toThrow('File too large');
    });
    
    it('should throw BadRequestError when file type is not allowed', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        mimetype: 'application/pdf'
      };
      
      expect(() => validateImageFile(mockFile)).toThrow(BadRequestError);
      expect(() => validateImageFile(mockFile)).toThrow('Invalid file type');
    });
  });
  
  describe('createDataURL', () => {
    it('should create a data URL from base64 and MIME type', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const mimeType = 'image/jpeg';
      
      const dataURL = createDataURL(base64, mimeType);
      
      expect(dataURL).toBe(`data:${mimeType};base64,${base64}`);
    });
    
    it('should work with different MIME types', () => {
      const base64 = 'SGVsbG8gV29ybGQ=';
      const mimeType = 'image/png';
      
      const dataURL = createDataURL(base64, mimeType);
      
      expect(dataURL).toBe(`data:${mimeType};base64,${base64}`);
    });
  });
});