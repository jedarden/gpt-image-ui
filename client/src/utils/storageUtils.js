/**
 * Browser storage utilities for chat history and image metadata
 */

// Storage keys
const STORAGE_KEYS = {
  CHAT_MESSAGES: 'gpt_image_ui_chat_messages',
  UPLOADED_IMAGES: 'gpt_image_ui_uploaded_images',
  GENERATED_IMAGES: 'gpt_image_ui_generated_images',
  STORAGE_STATS: 'gpt_image_ui_storage_stats',
  SETTINGS: 'gpt_image_ui_settings'
};

// Default storage limits (in bytes)
const DEFAULT_STORAGE_LIMITS = {
  CHAT_MESSAGES: 5 * 1024 * 1024, // 5MB
  IMAGES: 20 * 1024 * 1024, // 20MB
  TOTAL: 50 * 1024 * 1024 // 50MB
};

/**
 * Get current storage usage statistics
 * @returns {Object} Storage usage statistics
 */
export const getStorageStats = () => {
  try {
    const stats = localStorage.getItem(STORAGE_KEYS.STORAGE_STATS);
    return stats ? JSON.parse(stats) : {
      chatMessagesSize: 0,
      uploadedImagesSize: 0,
      generatedImagesSize: 0,
      totalSize: 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      chatMessagesSize: 0,
      uploadedImagesSize: 0,
      generatedImagesSize: 0,
      totalSize: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Update storage usage statistics
 * @param {Object} stats Updated storage statistics
 */
export const updateStorageStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STORAGE_STATS, JSON.stringify({
      ...stats,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error updating storage stats:', error);
  }
};

/**
 * Calculate the size of a string in bytes
 * @param {string} str String to calculate size for
 * @returns {number} Size in bytes
 */
export const getStringSizeInBytes = (str) => {
  return new Blob([str]).size;
};

/**
 * Check if adding new data would exceed storage limits
 * @param {string} key Storage key
 * @param {any} data Data to add
 * @returns {boolean} True if adding data would exceed limits
 */
export const wouldExceedStorageLimits = (key, data) => {
  try {
    const stats = getStorageStats();
    const dataStr = JSON.stringify(data);
    const dataSize = getStringSizeInBytes(dataStr);
    
    // Get current size for the specific storage type
    let currentSize = 0;
    if (key === STORAGE_KEYS.CHAT_MESSAGES) {
      currentSize = stats.chatMessagesSize;
    } else if (key === STORAGE_KEYS.UPLOADED_IMAGES || key === STORAGE_KEYS.GENERATED_IMAGES) {
      currentSize = stats.uploadedImagesSize + stats.generatedImagesSize;
    }
    
    // Check if adding this data would exceed limits
    const newSize = currentSize + dataSize;
    const totalNewSize = stats.totalSize + dataSize;
    
    const limits = getStorageLimits();
    
    if (key === STORAGE_KEYS.CHAT_MESSAGES && newSize > limits.CHAT_MESSAGES) {
      return true;
    }
    
    if ((key === STORAGE_KEYS.UPLOADED_IMAGES || key === STORAGE_KEYS.GENERATED_IMAGES) && 
        newSize > limits.IMAGES) {
      return true;
    }
    
    if (totalNewSize > limits.TOTAL) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking storage limits:', error);
    return false;
  }
};

/**
 * Get storage limits
 * @returns {Object} Storage limits
 */
export const getStorageLimits = () => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsedSettings = settings ? JSON.parse(settings) : {};
    
    return {
      CHAT_MESSAGES: parsedSettings.chatMessagesLimit || DEFAULT_STORAGE_LIMITS.CHAT_MESSAGES,
      IMAGES: parsedSettings.imagesLimit || DEFAULT_STORAGE_LIMITS.IMAGES,
      TOTAL: parsedSettings.totalLimit || DEFAULT_STORAGE_LIMITS.TOTAL
    };
  } catch (error) {
    console.error('Error getting storage limits:', error);
    return DEFAULT_STORAGE_LIMITS;
  }
};

/**
 * Update storage limits
 * @param {Object} limits Updated storage limits
 */
export const updateStorageLimits = (limits) => {
  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsedSettings = settings ? JSON.parse(settings) : {};
    
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      ...parsedSettings,
      chatMessagesLimit: limits.CHAT_MESSAGES || DEFAULT_STORAGE_LIMITS.CHAT_MESSAGES,
      imagesLimit: limits.IMAGES || DEFAULT_STORAGE_LIMITS.IMAGES,
      totalLimit: limits.TOTAL || DEFAULT_STORAGE_LIMITS.TOTAL
    }));
  } catch (error) {
    console.error('Error updating storage limits:', error);
  }
};

/**
 * Save data to localStorage with size tracking
 * @param {string} key Storage key
 * @param {any} data Data to save
 * @returns {boolean} True if save was successful
 */
export const saveToStorage = (key, data) => {
  try {
    const dataStr = JSON.stringify(data);
    const dataSize = getStringSizeInBytes(dataStr);
    
    // Get current stats
    const stats = getStorageStats();
    
    // Update size based on key
    if (key === STORAGE_KEYS.CHAT_MESSAGES) {
      const oldSize = stats.chatMessagesSize;
      stats.chatMessagesSize = dataSize;
      stats.totalSize = stats.totalSize - oldSize + dataSize;
    } else if (key === STORAGE_KEYS.UPLOADED_IMAGES) {
      const oldSize = stats.uploadedImagesSize;
      stats.uploadedImagesSize = dataSize;
      stats.totalSize = stats.totalSize - oldSize + dataSize;
    } else if (key === STORAGE_KEYS.GENERATED_IMAGES) {
      const oldSize = stats.generatedImagesSize;
      stats.generatedImagesSize = dataSize;
      stats.totalSize = stats.totalSize - oldSize + dataSize;
    }
    
    // Save data and update stats
    localStorage.setItem(key, dataStr);
    updateStorageStats(stats);
    
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key Storage key
 * @param {any} defaultValue Default value if key doesn't exist
 * @returns {any} Loaded data or default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Clear specific storage data
 * @param {string} key Storage key to clear
 */
export const clearStorage = (key) => {
  try {
    // Get current stats
    const stats = getStorageStats();
    
    // Update size based on key
    if (key === STORAGE_KEYS.CHAT_MESSAGES) {
      stats.totalSize -= stats.chatMessagesSize;
      stats.chatMessagesSize = 0;
    } else if (key === STORAGE_KEYS.UPLOADED_IMAGES) {
      stats.totalSize -= stats.uploadedImagesSize;
      stats.uploadedImagesSize = 0;
    } else if (key === STORAGE_KEYS.GENERATED_IMAGES) {
      stats.totalSize -= stats.generatedImagesSize;
      stats.generatedImagesSize = 0;
    }
    
    // Remove data and update stats
    localStorage.removeItem(key);
    updateStorageStats(stats);
  } catch (error) {
    console.error(`Error clearing storage (${key}):`, error);
  }
};

/**
 * Export all stored data as a JSON file
 * @returns {string} Data URL for the exported JSON file
 */
export const exportData = () => {
  try {
    const exportData = {
      chatMessages: loadFromStorage(STORAGE_KEYS.CHAT_MESSAGES, []),
      uploadedImages: loadFromStorage(STORAGE_KEYS.UPLOADED_IMAGES, []),
      generatedImages: loadFromStorage(STORAGE_KEYS.GENERATED_IMAGES, []),
      settings: loadFromStorage(STORAGE_KEYS.SETTINGS, {}),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    return dataUri;
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

/**
 * Import data from a JSON file
 * @param {Object} importData Data to import
 * @returns {boolean} True if import was successful
 */
export const importData = (importData) => {
  try {
    // Validate import data
    if (!importData || typeof importData !== 'object') {
      throw new Error('Invalid import data format');
    }
    
    // Import chat messages
    if (Array.isArray(importData.chatMessages)) {
      saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, importData.chatMessages);
    }
    
    // Import uploaded images
    if (Array.isArray(importData.uploadedImages)) {
      saveToStorage(STORAGE_KEYS.UPLOADED_IMAGES, importData.uploadedImages);
    }
    
    // Import generated images
    if (Array.isArray(importData.generatedImages)) {
      saveToStorage(STORAGE_KEYS.GENERATED_IMAGES, importData.generatedImages);
    }
    
    // Import settings
    if (importData.settings && typeof importData.settings === 'object') {
      const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, {});
      saveToStorage(STORAGE_KEYS.SETTINGS, { ...settings, ...importData.settings });
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
const storageUtils = {
  STORAGE_KEYS,
  DEFAULT_STORAGE_LIMITS,
  getStorageStats,
  updateStorageStats,
  getStringSizeInBytes,
  wouldExceedStorageLimits,
  getStorageLimits,
  updateStorageLimits,
  saveToStorage,
  loadFromStorage,
  clearStorage,
  exportData,
  importData
};

export default storageUtils;