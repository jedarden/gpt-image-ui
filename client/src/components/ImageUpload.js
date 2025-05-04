import React, { useState, useRef, useContext } from 'react';
import './ImageUpload.css';
import { ChatContext } from '../contexts/ChatContext';
import { fileToBase64, isImageFile, validateImageSize } from '../utils/imageUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageUpload = () => {
  const { uploadImage, uploadedImages, removeUploadedImage } = useContext(ChatContext);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
    // Reset the file input
    e.target.value = '';
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const processFile = async (file) => {
    setError(null);
    
    // Validate file type
    if (!isImageFile(file)) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size
    if (!validateImageSize(file, MAX_FILE_SIZE)) {
      setError(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Upload image
      uploadImage({
        file,
        base64Data,
        name: file.name,
        type: file.type,
        size: file.size
      });
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try again.');
    }
  };
  
  const handleRemoveImage = (imageId) => {
    removeUploadedImage(imageId);
  };
  
  return (
    <div className="image-upload">
      {/* Drag and drop area */}
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon">📷</div>
        <p className="upload-text">
          Click or drag an image here to upload
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
      
      {/* Preview of uploaded images */}
      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          {uploadedImages.map((image) => (
            <div key={image.id} className="uploaded-image">
              <img src={image.base64Data} alt={image.name} />
              <button 
                className="remove-image" 
                onClick={() => handleRemoveImage(image.id)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;