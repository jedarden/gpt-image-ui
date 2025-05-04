import React, { useContext, useRef, useState, useEffect } from 'react';
import './ImageMaskingModal.css';
import { UIContext } from '../contexts/UIContext';
import { ChatContext } from '../contexts/ChatContext';
import { createImageFromUrl, canvasToDataUrl } from '../utils/imageUtils';

const ImageMaskingModal = () => {
  const { modalState, closeMaskingModal } = useContext(UIContext);
  const { addMaskedImage } = useContext(ChatContext);
  
  const { isOpen, image } = modalState.masking;
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [originalImage, setOriginalImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Initialize canvas when modal opens
  useEffect(() => {
    if (!isOpen || !image || !image.url) return;
    
    const loadImage = async () => {
      try {
        // Load the image
        const img = await createImageFromUrl(image.url);
        setOriginalImage(img);
        
        // Calculate canvas size (maintain aspect ratio)
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.6;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        if (height > maxHeight) {
          const ratio = maxHeight / height;
          height = height * ratio;
          width = width * ratio;
        }
        
        setCanvasSize({ width, height });
        
        // Initialize canvas with image
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
      } catch (error) {
        console.error('Error loading image for masking:', error);
      }
    };
    
    loadImage();
  }, [isOpen, image]);
  
  // Handle drawing on canvas
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    
    // Set drawing style
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Start new path
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Continue path
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  };
  
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  };
  
  const handleTouchEnd = () => {
    stopDrawing();
  };
  
  // Reset canvas to original image
  const handleReset = () => {
    if (!originalImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw original image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  };
  
  // Apply mask and close modal
  const handleApply = () => {
    if (!canvasRef.current || !originalImage) return;
    
    const canvas = canvasRef.current;
    
    // Get mask data URL
    const maskDataUrl = canvasToDataUrl(canvas);
    
    // Add masked image to chat context
    addMaskedImage({
      originalImage: image,
      maskDataUrl,
      width: canvas.width,
      height: canvas.height
    });
    
    // Close modal
    closeMaskingModal();
  };
  
  if (!isOpen || !image) {
    return null;
  }
  
  return (
    <div className="image-masking-modal">
      <div className="masking-content">
        <div className="masking-header">
          <h3>Create Mask for Inpainting</h3>
          <button 
            className="close-button" 
            onClick={closeMaskingModal}
            aria-label="Close masking modal"
          >
            ×
          </button>
        </div>
        
        <div className="masking-instructions">
          <p>Draw on the areas you want to replace. These areas will be regenerated.</p>
        </div>
        
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
        
        <div className="masking-controls">
          <div className="brush-size-control">
            <label htmlFor="brush-size">Brush Size:</label>
            <input
              id="brush-size"
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
            <span>{brushSize}px</span>
          </div>
          
          <div className="masking-actions">
            <button 
              className="reset-button"
              onClick={handleReset}
              aria-label="Reset mask"
            >
              Reset
            </button>
            <button 
              className="apply-button"
              onClick={handleApply}
              aria-label="Apply mask"
            >
              Apply Mask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMaskingModal;