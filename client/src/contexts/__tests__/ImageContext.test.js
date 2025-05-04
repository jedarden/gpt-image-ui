import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ImageProvider, ImageContext } from '../ImageContext';
import { AuthContext } from '../AuthContext';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api', () => ({
  post: jest.fn()
}));

// Test component that consumes the context
const TestComponent = () => {
  const {
    uploadedImages,
    generatedImages,
    isLoading,
    uploadProgress,
    error,
    uploadImage,
    generateImage,
    editImage,
    getImageUrl,
    clearUploadedImages,
    clearGeneratedImages
  } = React.useContext(ImageContext);
  
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="upload-progress">{uploadProgress}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="uploaded-images-count">{uploadedImages.length}</div>
      <div data-testid="generated-images-count">{generatedImages.length}</div>
      
      <button 
        data-testid="upload-image" 
        onClick={() => {
          const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
          uploadImage(file);
        }}
      >
        Upload Image
      </button>
      
      <button 
        data-testid="generate-image" 
        onClick={() => generateImage('A beautiful landscape')}
      >
        Generate Image
      </button>
      
      <button 
        data-testid="edit-image" 
        onClick={() => editImage('image-id', 'Add mountains', 'base64-mask')}
      >
        Edit Image
      </button>
      
      <button 
        data-testid="clear-uploaded" 
        onClick={clearUploadedImages}
      >
        Clear Uploaded
      </button>
      
      <button 
        data-testid="clear-generated" 
        onClick={clearGeneratedImages}
      >
        Clear Generated
      </button>
      
      <div data-testid="image-url">{getImageUrl('test-image-id')}</div>
    </div>
  );
};

// Mock AuthContext wrapper
const AuthContextWrapper = ({ children, isAuthenticated = true }) => (
  <AuthContext.Provider value={{ isAuthenticated }}>
    {children}
  </AuthContext.Provider>
);

describe('ImageContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileReader
    global.FileReader = class {
      constructor() {
        this.readAsDataURL = jest.fn();
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,test-base64-data';
          this.onload();
        }, 0);
      }
    };
  });
  
  it('should initialize with empty state', () => {
    render(
      <AuthContextWrapper>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Check initial state
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('upload-progress').textContent).toBe('0');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
    expect(screen.getByTestId('uploaded-images-count').textContent).toBe('0');
    expect(screen.getByTestId('generated-images-count').textContent).toBe('0');
    expect(screen.getByTestId('image-url').textContent).toBe('/api/images/test-image-id');
  });
  
  it('should upload an image when authenticated', async () => {
    // Mock API response
    api.post.mockResolvedValueOnce({
      data: {
        id: 'uploaded-image-id',
        url: '/api/images/uploaded-image-id',
        filename: 'test.jpg'
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Upload an image
    act(() => {
      screen.getByTestId('upload-image').click();
    });
    
    // Check that the loading state is updated
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the API was called with the correct payload
    expect(api.post).toHaveBeenCalledWith(
      '/api/images/upload',
      {
        image: 'test-base64-data',
        filename: 'test.jpg'
      },
      expect.objectContaining({
        onUploadProgress: expect.any(Function)
      })
    );
    
    // Check that the uploaded images were updated
    expect(screen.getByTestId('uploaded-images-count').textContent).toBe('1');
  });
  
  it('should not upload an image when not authenticated', async () => {
    render(
      <AuthContextWrapper isAuthenticated={false}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Upload an image
    act(() => {
      screen.getByTestId('upload-image').click();
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('You must be authenticated to upload images');
    
    // Check that the API was not called
    expect(api.post).not.toHaveBeenCalled();
  });
  
  it('should handle upload error', async () => {
    // Mock API error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Upload failed: File too large'
        }
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Upload an image
    act(() => {
      screen.getByTestId('upload-image').click();
    });
    
    // Wait for the API error
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('Upload failed: File too large');
  });
  
  it('should generate an image when authenticated', async () => {
    // Mock API response
    api.post.mockResolvedValueOnce({
      data: {
        images: [
          {
            id: 'generated-image-id',
            url: '/api/images/generated-image-id',
            prompt: 'A beautiful landscape'
          }
        ]
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Generate an image
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Check that the loading state is updated
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the API was called with the correct payload
    expect(api.post).toHaveBeenCalledWith(
      '/api/images/generate',
      {
        prompt: 'A beautiful landscape',
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        background: 'transparent'
      }
    );
    
    // Check that the generated images were updated
    expect(screen.getByTestId('generated-images-count').textContent).toBe('1');
  });
  
  it('should not generate an image when not authenticated', async () => {
    render(
      <AuthContextWrapper isAuthenticated={false}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Generate an image
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('You must be authenticated to generate images');
    
    // Check that the API was not called
    expect(api.post).not.toHaveBeenCalled();
  });
  
  it('should handle generation error', async () => {
    // Mock API error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Generation failed: Invalid prompt'
        }
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Generate an image
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Wait for the API error
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('Generation failed: Invalid prompt');
  });
  
  it('should edit an image when authenticated', async () => {
    // Mock API response
    api.post.mockResolvedValueOnce({
      data: {
        images: [
          {
            id: 'edited-image-id',
            url: '/api/images/edited-image-id',
            prompt: 'Add mountains'
          }
        ]
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Edit an image
    act(() => {
      screen.getByTestId('edit-image').click();
    });
    
    // Check that the loading state is updated
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the API was called with the correct payload
    expect(api.post).toHaveBeenCalledWith(
      '/api/images/edit',
      {
        image: 'image-id',
        prompt: 'Add mountains',
        mask: 'base64-mask',
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      }
    );
    
    // Check that the generated images were updated
    expect(screen.getByTestId('generated-images-count').textContent).toBe('1');
  });
  
  it('should not edit an image when not authenticated', async () => {
    render(
      <AuthContextWrapper isAuthenticated={false}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Edit an image
    act(() => {
      screen.getByTestId('edit-image').click();
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('You must be authenticated to edit images');
    
    // Check that the API was not called
    expect(api.post).not.toHaveBeenCalled();
  });
  
  it('should handle edit error', async () => {
    // Mock API error
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Edit failed: Invalid mask'
        }
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Edit an image
    act(() => {
      screen.getByTestId('edit-image').click();
    });
    
    // Wait for the API error
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Check that the error state is updated
    expect(screen.getByTestId('error').textContent).toBe('Edit failed: Invalid mask');
  });
  
  it('should clear uploaded images', async () => {
    // Mock API response for upload
    api.post.mockResolvedValueOnce({
      data: {
        id: 'uploaded-image-id',
        url: '/api/images/uploaded-image-id',
        filename: 'test.jpg'
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Upload an image
    act(() => {
      screen.getByTestId('upload-image').click();
    });
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('uploaded-images-count').textContent).toBe('1');
    });
    
    // Clear uploaded images
    act(() => {
      screen.getByTestId('clear-uploaded').click();
    });
    
    // Check that the uploaded images were cleared
    expect(screen.getByTestId('uploaded-images-count').textContent).toBe('0');
  });
  
  it('should clear generated images', async () => {
    // Mock API response for generation
    api.post.mockResolvedValueOnce({
      data: {
        images: [
          {
            id: 'generated-image-id',
            url: '/api/images/generated-image-id',
            prompt: 'A beautiful landscape'
          }
        ]
      }
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Generate an image
    act(() => {
      screen.getByTestId('generate-image').click();
    });
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('generated-images-count').textContent).toBe('1');
    });
    
    // Clear generated images
    act(() => {
      screen.getByTestId('clear-generated').click();
    });
    
    // Check that the generated images were cleared
    expect(screen.getByTestId('generated-images-count').textContent).toBe('0');
  });
  
  it('should update upload progress', async () => {
    // Mock API response
    api.post.mockImplementationOnce((url, data, config) => {
      // Simulate upload progress
      if (config && config.onUploadProgress) {
        config.onUploadProgress({ loaded: 50, total: 100 });
      }
      
      return Promise.resolve({
        data: {
          id: 'uploaded-image-id',
          url: '/api/images/uploaded-image-id',
          filename: 'test.jpg'
        }
      });
    });
    
    render(
      <AuthContextWrapper isAuthenticated={true}>
        <ImageProvider>
          <TestComponent />
        </ImageProvider>
      </AuthContextWrapper>
    );
    
    // Upload an image
    act(() => {
      screen.getByTestId('upload-image').click();
    });
    
    // Check that the upload progress is updated
    expect(screen.getByTestId('upload-progress').textContent).toBe('50');
    
    // Wait for the API response
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });
});