import React, { useContext, useState } from 'react';
import './ImageMessage.css';
import { UIContext } from '../contexts/UIContext';

const ImageMessage = ({ image }) => {
  const { openImageViewer, openMaskingModal } = useContext(UIContext);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const handleImageClick = () => {
    // Open the image viewer modal
    openImageViewer([image], 0);
  };
  
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    // Open the masking modal for editing
    openMaskingModal(image);
  };
  
  const handleImageLoad = () => {
    setIsLoaded(true);
  };
  
  const handleImageError = () => {
    setError(true);
    setIsLoaded(true); // Consider it "loaded" to remove loading state
  };
  
  return (
    <div className={`image-message ${isLoaded ? 'loaded' : 'loading'}`}>
      {!isLoaded && !error && (
        <div className="image-loading">
          <div className="spinner"></div>
        </div>
      )}
      
      {error ? (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <div className="image-container" onClick={handleImageClick}>
          <img 
            src={image.url} 
            alt={image.alt || "Generated image"} 
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="image-actions">
            <button 
              className="edit-button" 
              onClick={handleEditClick}
              aria-label="Edit image"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMessage;