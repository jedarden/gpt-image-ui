import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import storageUtils from '../utils/storageUtils';
import { v4 as uuidv4 } from 'uuid';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [storageWarning, setStorageWarning] = useState(null);

  // Load images from localStorage
  const loadImages = () => {
    try {
      // Load uploaded images
      const savedUploadedImages = storageUtils.loadFromStorage(
        storageUtils.STORAGE_KEYS.UPLOADED_IMAGES,
        []
      );
      
      if (savedUploadedImages && savedUploadedImages.length > 0) {
        setUploadedImages(savedUploadedImages);
      }
      
      // Load generated images
      const savedGeneratedImages = storageUtils.loadFromStorage(
        storageUtils.STORAGE_KEYS.GENERATED_IMAGES,
        []
      );
      
      if (savedGeneratedImages && savedGeneratedImages.length > 0) {
        setGeneratedImages(savedGeneratedImages);
      }
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images from local storage.');
    }
  };

  // Save uploaded images to localStorage
  const saveUploadedImages = useCallback(() => {
    try {
      // Check if adding this data would exceed storage limits
      if (storageUtils.wouldExceedStorageLimits(
        storageUtils.STORAGE_KEYS.UPLOADED_IMAGES,
        uploadedImages
      )) {
        setStorageWarning('Image storage is approaching limits. Consider clearing some images.');
      } else {
        setStorageWarning(null);
      }
      
      // Save to localStorage
      storageUtils.saveToStorage(
        storageUtils.STORAGE_KEYS.UPLOADED_IMAGES,
        uploadedImages
      );
    } catch (err) {
      console.error('Error saving uploaded images:', err);
    }
  }, [uploadedImages]);

  // Save generated images to localStorage
  const saveGeneratedImages = useCallback(() => {
    try {
      // Check if adding this data would exceed storage limits
      if (storageUtils.wouldExceedStorageLimits(
        storageUtils.STORAGE_KEYS.GENERATED_IMAGES,
        generatedImages
      )) {
        setStorageWarning('Image storage is approaching limits. Consider clearing some images.');
      } else if (!storageWarning) {
        setStorageWarning(null);
      }
      
      // Save to localStorage
      storageUtils.saveToStorage(
        storageUtils.STORAGE_KEYS.GENERATED_IMAGES,
        generatedImages
      );
    } catch (err) {
      console.error('Error saving generated images:', err);
    }
  }, [generatedImages, storageWarning]);

  // Load images from localStorage on mount
  useEffect(() => {
    loadImages();
  }, []);

  // Save images to localStorage whenever they change
  useEffect(() => {
    if (uploadedImages.length > 0) {
      saveUploadedImages();
    }
  }, [uploadedImages, saveUploadedImages]);

  useEffect(() => {
    if (generatedImages.length > 0) {
      saveGeneratedImages();
    }
  }, [generatedImages, saveGeneratedImages]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload an image (store locally)
  const uploadImage = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      // Convert file to base64
      const base64Image = await fileToBase64(file);
      
      // Create a progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create local image object
      const uploadedImage = {
        id: uuidv4(),
        url: base64Image,
        filename: file.name,
        timestamp: new Date().toISOString(),
        size: file.size,
        type: file.type
      };

      // Add to state
      setUploadedImages(prevImages => [uploadedImage, ...prevImages]);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      return uploadedImage;
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Image upload failed: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate an image from a prompt
  const generateImage = async (prompt, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create generation payload
      const payload = {
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        background: options.background || 'transparent'
      };

      // Generate image
      const response = await api.post('/images/generate', payload);

      // Add generated images to state
      const newImages = response.data.images;
      setGeneratedImages(prevImages => [...newImages, ...prevImages]);

      return newImages;
    } catch (err) {
      console.error('Image generation failed:', err);
      setError(err.response?.data?.message || 'Image generation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Edit an image with a mask
  const editImage = async (imageId, prompt, maskBase64, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create edit payload
      const payload = {
        image: imageId,
        prompt,
        mask: maskBase64,
        n: options.n || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard'
      };

      // Edit image
      const response = await api.post('/images/edit', payload);

      // Add edited images to state
      const newImages = response.data.images;
      setGeneratedImages(prevImages => [...newImages, ...prevImages]);

      return newImages;
    } catch (err) {
      console.error('Image edit failed:', err);
      setError(err.response?.data?.message || 'Image edit failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get image URL (either API URL or data URL)
  const getImageUrl = (imageId) => {
    // First check if it's a local image
    const localUploadedImage = uploadedImages.find(img => img.id === imageId);
    if (localUploadedImage && localUploadedImage.url) {
      return localUploadedImage.url;
    }
    
    const localGeneratedImage = generatedImages.find(img => img.id === imageId);
    if (localGeneratedImage && localGeneratedImage.url) {
      return localGeneratedImage.url;
    }
    
    // If not found locally, assume it's from the API
    return `/images/${imageId}`;
  };

  // Clear uploaded images
  const clearUploadedImages = () => {
    setUploadedImages([]);
    storageUtils.clearStorage(storageUtils.STORAGE_KEYS.UPLOADED_IMAGES);
    updateStorageWarning();
  };

  // Clear generated images
  const clearGeneratedImages = () => {
    setGeneratedImages([]);
    storageUtils.clearStorage(storageUtils.STORAGE_KEYS.GENERATED_IMAGES);
    updateStorageWarning();
  };
  
  // Update storage warning based on current usage
  const updateStorageWarning = () => {
    const stats = storageUtils.getStorageStats();
    const limits = storageUtils.getStorageLimits();
    
    if (stats.totalSize > limits.TOTAL * 0.8) {
      setStorageWarning('Storage usage is high. Consider clearing some data.');
    } else {
      setStorageWarning(null);
    }
  };
  
  // Get storage usage statistics
  const getStorageStats = () => {
    return storageUtils.getStorageStats();
  };

  return (
    <ImageContext.Provider
      value={{
        uploadedImages,
        generatedImages,
        isLoading,
        uploadProgress,
        error,
        storageWarning,
        uploadImage,
        generateImage,
        editImage,
        getImageUrl,
        clearUploadedImages,
        clearGeneratedImages,
        getStorageStats
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};