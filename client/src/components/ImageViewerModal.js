import React, { useContext, useEffect } from 'react';
import './ImageViewerModal.css';
import { UIContext } from '../contexts/UIContext';

const ImageViewerModal = () => {
  const { 
    modalState, 
    closeImageViewer, 
    navigateImage, 
    openMaskingModal 
  } = useContext(UIContext);
  
  const { isOpen, images, currentIndex } = modalState.imageViewer;
  
  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImageViewer();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeImageViewer, navigateImage]);
  
  if (!isOpen || !images || images.length === 0) {
    return null;
  }
  
  const currentImage = images[currentIndex];
  
  const handleEditClick = () => {
    closeImageViewer();
    openMaskingModal(currentImage);
  };
  
  const handleBackdropClick = (e) => {
    // Close only if clicking the backdrop, not the content
    if (e.target.classList.contains('image-viewer-modal')) {
      closeImageViewer();
    }
  };
  
  return (
    <div className="image-viewer-modal" onClick={handleBackdropClick}>
      <div className="image-viewer-content">
        <button 
          className="close-button" 
          onClick={closeImageViewer}
          aria-label="Close image viewer"
        >
          ×
        </button>
        
        <div className="image-display">
          <img 
            src={currentImage.url} 
            alt={currentImage.alt || "Viewed image"} 
          />
        </div>
        
        <div className="image-viewer-controls">
          <button 
            className="nav-button prev"
            onClick={() => navigateImage('prev')}
            disabled={images.length <= 1}
            aria-label="Previous image"
          >
            &#10094;
          </button>
          
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
          
          <button 
            className="nav-button next"
            onClick={() => navigateImage('next')}
            disabled={images.length <= 1}
            aria-label="Next image"
          >
            &#10095;
          </button>
        </div>
        
        <div className="image-viewer-actions">
          <button 
            className="edit-image-button"
            onClick={handleEditClick}
            aria-label="Edit image"
          >
            Edit with Mask
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;