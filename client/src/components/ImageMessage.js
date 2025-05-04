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
  
  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src.substring(0, 30) + '...', e);
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
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          {/* Debug info - remove in production */}
          <div className="image-debug" style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px', display: 'none' }}>
            {image.url ? image.url.substring(0, 20) + '...' : 'No URL'}
          </div>
          
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