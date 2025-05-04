import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ImageMaskingModal from '../ImageMaskingModal';
import { UIContext } from '../../contexts/UIContext';
import { ChatContext } from '../../contexts/ChatContext';
import * as imageUtils from '../../utils/imageUtils';

// Mock the imageUtils functions
jest.mock('../../utils/imageUtils', () => ({
  createCanvasWithImage: jest.fn(),
  createImageFromUrl: jest.fn(),
  canvasToDataUrl: jest.fn()
}));

// Mock canvas and context
const mockCanvas = {
  getContext: jest.fn(),
  width: 500,
  height: 300,
  getBoundingClientRect: jest.fn(() => ({
    left: 0,
    top: 0
  }))
};

const mockContext = {
  drawImage: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn()
};

// Mock UIContext
const mockUIContext = {
  modalState: {
    masking: {
      isOpen: true,
      image: {
        id: 'test-image-id',
        url: 'test-image-url'
      }
    }
  },
  closeMaskingModal: jest.fn()
};

// Mock ChatContext
const mockChatContext = {
  addMaskedImage: jest.fn()
};

describe('ImageMaskingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock canvas ref
    mockCanvas.getContext.mockReturnValue(mockContext);
    jest.spyOn(React, 'useRef').mockReturnValue({ current: mockCanvas });
    
    // Mock window dimensions
    global.innerWidth = 1024;
    global.innerHeight = 768;
    
    // Mock image loading
    const mockImage = {
      width: 800,
      height: 600
    };
    imageUtils.createImageFromUrl.mockResolvedValue(mockImage);
    imageUtils.canvasToDataUrl.mockReturnValue('data:image/png;base64,test-mask-data');
  });
  
  it('should render the modal when open', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Check that the modal is rendered
    expect(screen.getByText('Create Mask for Inpainting')).toBeInTheDocument();
    expect(screen.getByText('Draw on the areas you want to replace. These areas will be regenerated.')).toBeInTheDocument();
    
    // Check that the canvas is rendered
    expect(screen.getByRole('img')).toBeInTheDocument();
    
    // Check that the controls are rendered
    expect(screen.getByLabelText('Brush Size:')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Apply Mask')).toBeInTheDocument();
  });
  
  it('should not render when modal is closed', () => {
    const closedUIContext = {
      ...mockUIContext,
      modalState: {
        masking: {
          isOpen: false,
          image: null
        }
      }
    };
    
    render(
      <UIContext.Provider value={closedUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Check that the modal is not rendered
    expect(screen.queryByText('Create Mask for Inpainting')).not.toBeInTheDocument();
  });
  
  it('should initialize canvas with image', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Check that the image was loaded
    expect(imageUtils.createImageFromUrl).toHaveBeenCalledWith('test-image-url');
    
    // Check that the canvas was initialized
    expect(mockContext.drawImage).toHaveBeenCalled();
  });
  
  it('should handle brush size changes', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the brush size slider
    const brushSizeSlider = screen.getByLabelText('Brush Size:');
    
    // Change the brush size
    fireEvent.change(brushSizeSlider, { target: { value: '30' } });
    
    // Check that the brush size was updated
    expect(screen.getByText('30px')).toBeInTheDocument();
  });
  
  it('should handle drawing on canvas', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the canvas
    const canvas = screen.getByRole('img');
    
    // Simulate mouse down
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    
    // Check that drawing started
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.stroke).toHaveBeenCalled();
    
    // Simulate mouse move
    fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
    
    // Check that drawing continued
    expect(mockContext.lineTo).toHaveBeenCalledWith(150, 150);
    expect(mockContext.stroke).toHaveBeenCalledTimes(2);
    
    // Simulate mouse up
    fireEvent.mouseUp(canvas);
    
    // Simulate another mouse move (should not draw)
    mockContext.lineTo.mockClear();
    mockContext.stroke.mockClear();
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    
    // Check that drawing stopped
    expect(mockContext.lineTo).not.toHaveBeenCalled();
    expect(mockContext.stroke).not.toHaveBeenCalled();
  });
  
  it('should handle touch events', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the canvas
    const canvas = screen.getByRole('img');
    
    // Simulate touch start
    fireEvent.touchStart(canvas, { 
      touches: [{ clientX: 100, clientY: 100 }],
      preventDefault: jest.fn()
    });
    
    // Check that drawing started
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
    expect(mockContext.stroke).toHaveBeenCalled();
    
    // Simulate touch move
    fireEvent.touchMove(canvas, { 
      touches: [{ clientX: 150, clientY: 150 }],
      preventDefault: jest.fn()
    });
    
    // Check that drawing continued
    expect(mockContext.lineTo).toHaveBeenCalledWith(150, 150);
    expect(mockContext.stroke).toHaveBeenCalledTimes(2);
    
    // Simulate touch end
    fireEvent.touchEnd(canvas);
    
    // Simulate another touch move (should not draw)
    mockContext.lineTo.mockClear();
    mockContext.stroke.mockClear();
    fireEvent.touchMove(canvas, { 
      touches: [{ clientX: 200, clientY: 200 }],
      preventDefault: jest.fn()
    });
    
    // Check that drawing stopped
    expect(mockContext.lineTo).not.toHaveBeenCalled();
    expect(mockContext.stroke).not.toHaveBeenCalled();
  });
  
  it('should reset canvas when reset button is clicked', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Click the reset button
    fireEvent.click(screen.getByText('Reset'));
    
    // Check that the canvas was reset
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    expect(mockContext.drawImage).toHaveBeenCalledTimes(2); // Once on init, once on reset
  });
  
  it('should apply mask and close modal when apply button is clicked', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Click the apply button
    fireEvent.click(screen.getByText('Apply Mask'));
    
    // Check that the mask was applied
    expect(imageUtils.canvasToDataUrl).toHaveBeenCalledWith(mockCanvas);
    expect(mockChatContext.addMaskedImage).toHaveBeenCalledWith({
      originalImage: mockUIContext.modalState.masking.image,
      maskDataUrl: 'data:image/png;base64,test-mask-data',
      width: mockCanvas.width,
      height: mockCanvas.height
    });
    
    // Check that the modal was closed
    expect(mockUIContext.closeMaskingModal).toHaveBeenCalled();
  });
  
  it('should close modal when close button is clicked', async () => {
    render(
      <UIContext.Provider value={mockUIContext}>
        <ChatContext.Provider value={mockChatContext}>
          <ImageMaskingModal />
        </ChatContext.Provider>
      </UIContext.Provider>
    );
    
    // Wait for image to load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Click the close button
    fireEvent.click(screen.getByLabelText('Close masking modal'));
    
    // Check that the modal was closed
    expect(mockUIContext.closeMaskingModal).toHaveBeenCalled();
  });
});