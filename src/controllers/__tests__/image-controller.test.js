const { uploadImage, generateImages, editImages } = require('../image-controller');
const { imageService } = require('../../services');
const { validators } = require('../../utils');
const { ValidationError } = require('../../utils/error');

// Mock dependencies
jest.mock('../../services', () => ({
  imageService: {
    processUpload: jest.fn(),
    generateImages: jest.fn(),
    editImages: jest.fn()
  }
}));

jest.mock('../../utils', () => ({
  validators: {
    validateGenerateRequest: jest.fn(),
    validateEditRequest: jest.fn()
  }
}));

describe('Image Controller', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next function
    req = {
      file: {
        buffer: Buffer.from('test-image-data'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      },
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock successful validation by default
    validators.validateGenerateRequest.mockImplementation(body => body);
    validators.validateEditRequest.mockImplementation(body => body);
  });
  
  describe('uploadImage', () => {
    it('should process an uploaded image and return image data', async () => {
      // Mock image service response
      const mockImageData = {
        id: 'image-id',
        url: '/api/images/image-id',
        filename: 'test.jpg'
      };
      
      imageService.processUpload.mockResolvedValueOnce(mockImageData);
      
      // Call the controller
      await uploadImage(req, res, next);
      
      // Check that the image service was called with the file
      expect(imageService.processUpload).toHaveBeenCalledWith(req.file);
      
      // Check that the response was sent with the correct status and body
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockImageData);
      
      // Check that next was not called (no error)
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should handle missing file error', async () => {
      // Remove file from request
      req.file = null;
      
      // Call the controller
      await uploadImage(req, res, next);
      
      // Check that the image service was not called
      expect(imageService.processUpload).not.toHaveBeenCalled();
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with an error
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No image file uploaded',
        statusCode: 400,
        code: 'FILE_MISSING'
      }));
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Service error');
      
      imageService.processUpload.mockRejectedValueOnce(serviceError);
      
      // Call the controller
      await uploadImage(req, res, next);
      
      // Check that the image service was called with the file
      expect(imageService.processUpload).toHaveBeenCalledWith(req.file);
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
  
  describe('generateImages', () => {
    beforeEach(() => {
      // Set up request body for image generation
      req.body = {
        prompt: 'A beautiful landscape',
        n: 1,
        size: '1024x1024'
      };
    });
    
    it('should generate images from a prompt and return response', async () => {
      // Mock image service response
      const mockResponse = {
        images: [
          {
            id: 'generated-image-id',
            url: '/api/images/generated-image-id'
          }
        ]
      };
      
      imageService.generateImages.mockResolvedValueOnce(mockResponse);
      
      // Call the controller
      await generateImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateGenerateRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was called with the validated body
      expect(imageService.generateImages).toHaveBeenCalledWith(req.body);
      
      // Check that the response was sent with the correct status and body
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      
      // Check that next was not called (no error)
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should handle validation errors', async () => {
      // Mock validation error
      const validationError = new ValidationError('Invalid generation request', 'INVALID_GENERATE_REQUEST', {
        prompt: 'Prompt is required'
      });
      
      validators.validateGenerateRequest.mockImplementationOnce(() => {
        throw validationError;
      });
      
      // Call the controller
      await generateImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateGenerateRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was not called
      expect(imageService.generateImages).not.toHaveBeenCalled();
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(validationError);
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Service error');
      
      imageService.generateImages.mockRejectedValueOnce(serviceError);
      
      // Call the controller
      await generateImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateGenerateRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was called with the validated body
      expect(imageService.generateImages).toHaveBeenCalledWith(req.body);
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
  
  describe('editImages', () => {
    beforeEach(() => {
      // Set up request body for image editing
      req.body = {
        image: 'image-id',
        prompt: 'Add mountains in the background',
        mask: 'base64-mask-data'
      };
    });
    
    it('should edit images with a prompt and mask and return response', async () => {
      // Mock image service response
      const mockResponse = {
        images: [
          {
            id: 'edited-image-id',
            url: '/api/images/edited-image-id'
          }
        ]
      };
      
      imageService.editImages.mockResolvedValueOnce(mockResponse);
      
      // Call the controller
      await editImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateEditRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was called with the validated body
      expect(imageService.editImages).toHaveBeenCalledWith(req.body);
      
      // Check that the response was sent with the correct status and body
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      
      // Check that next was not called (no error)
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should handle validation errors', async () => {
      // Mock validation error
      const validationError = new ValidationError('Invalid edit request', 'INVALID_EDIT_REQUEST', {
        image: 'Image is required'
      });
      
      validators.validateEditRequest.mockImplementationOnce(() => {
        throw validationError;
      });
      
      // Call the controller
      await editImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateEditRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was not called
      expect(imageService.editImages).not.toHaveBeenCalled();
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(validationError);
    });
    
    it('should handle service errors', async () => {
      // Mock service error
      const serviceError = new Error('Service error');
      
      imageService.editImages.mockRejectedValueOnce(serviceError);
      
      // Call the controller
      await editImages(req, res, next);
      
      // Check that the validator was called with the request body
      expect(validators.validateEditRequest).toHaveBeenCalledWith(req.body);
      
      // Check that the image service was called with the validated body
      expect(imageService.editImages).toHaveBeenCalledWith(req.body);
      
      // Check that the response was not sent
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      
      // Check that next was called with the error
      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});