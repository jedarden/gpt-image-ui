/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise resolving to base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extracts base64 data from a data URL
 * @param {string} dataUrl - The data URL
 * @returns {string} - The base64 data
 */
export const extractBase64Data = (dataUrl) => {
  return dataUrl.split(',')[1];
};

/**
 * Creates an image element from a URL
 * @param {string} url - The image URL
 * @returns {Promise<HTMLImageElement>} - Promise resolving to an image element
 */
export const createImageFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

/**
 * Creates a canvas with the image drawn on it
 * @param {HTMLImageElement} img - The image element
 * @param {number} width - The canvas width
 * @param {number} height - The canvas height
 * @returns {HTMLCanvasElement} - The canvas element
 */
export const createCanvasWithImage = (img, width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width || img.width;
  canvas.height = height || img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Creates a mask canvas with transparent background
 * @param {number} width - The canvas width
 * @param {number} height - The canvas height
 * @returns {HTMLCanvasElement} - The mask canvas
 */
export const createMaskCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, width, height);
  return canvas;
};

/**
 * Converts a canvas to a data URL
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} format - The image format (default: 'image/png')
 * @param {number} quality - The image quality (0-1, default: 0.92)
 * @returns {string} - The data URL
 */
export const canvasToDataUrl = (canvas, format = 'image/png', quality = 0.92) => {
  return canvas.toDataURL(format, quality);
};

/**
 * Resizes an image to fit within the specified dimensions while maintaining aspect ratio
 * @param {HTMLImageElement} img - The image element
 * @param {number} maxWidth - The maximum width
 * @param {number} maxHeight - The maximum height
 * @returns {Object} - Object containing width and height
 */
export const calculateAspectRatioFit = (img, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return {
    width: img.width * ratio,
    height: img.height * ratio
  };
};

/**
 * Validates if a file is an image
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file is an image
 */
export const isImageFile = (file) => {
  return file && file.type.startsWith('image/');
};

/**
 * Validates image dimensions
 * @param {HTMLImageElement} img - The image element
 * @param {number} minWidth - The minimum width
 * @param {number} minHeight - The minimum height
 * @param {number} maxWidth - The maximum width
 * @param {number} maxHeight - The maximum height
 * @returns {boolean} - True if dimensions are valid
 */
export const validateImageDimensions = (img, minWidth, minHeight, maxWidth, maxHeight) => {
  return (
    img.width >= minWidth &&
    img.height >= minHeight &&
    img.width <= maxWidth &&
    img.height <= maxHeight
  );
};

/**
 * Validates image file size
 * @param {File} file - The image file
 * @param {number} maxSizeInBytes - The maximum size in bytes
 * @returns {boolean} - True if size is valid
 */
export const validateImageSize = (file, maxSizeInBytes) => {
  return file.size <= maxSizeInBytes;
};