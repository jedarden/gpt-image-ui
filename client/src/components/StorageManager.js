import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { ImageContext } from '../contexts/ImageContext';
import storageUtils from '../utils/storageUtils';
import './StorageManager.css';

const StorageManager = () => {
  const { exportChatHistory, importChatHistory, clearChat, storageWarning: chatWarning } = useContext(ChatContext);
  const { 
    clearUploadedImages, 
    clearGeneratedImages, 
    storageWarning: imageWarning,
    getStorageStats
  } = useContext(ImageContext);
  
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(null);
  const [importFile, setImportFile] = useState(null);
  
  // Update storage statistics
  const updateStats = useCallback(() => {
    const currentStats = getStorageStats();
    setStats(currentStats);
  }, [getStorageStats]);
  
  // Update stats periodically
  useEffect(() => {
    updateStats();
    
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [updateStats]);
  
  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Calculate percentage of usage
  const calculatePercentage = (used, total) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };
  
  // Handle file selection for import
  const handleFileSelect = (e) => {
    setImportFile(e.target.files[0]);
  };
  
  // Handle import
  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          importChatHistory(importData);
          setImportFile(null);
          updateStats();
        } catch (err) {
          console.error('Error parsing import file:', err);
          alert('Invalid import file format. Please select a valid export file.');
        }
      };
      
      reader.readAsText(importFile);
    } catch (err) {
      console.error('Error reading import file:', err);
      alert('Error reading import file. Please try again.');
    }
  };
  
  // Handle export
  const handleExport = () => {
    exportChatHistory();
  };
  
  // Handle clear all data
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearChat();
      clearUploadedImages();
      clearGeneratedImages();
      updateStats();
    }
  };
  
  // Get storage limits
  const limits = storageUtils.getStorageLimits();
  
  // Show warning if any
  const warning = chatWarning || imageWarning;
  
  return (
    <div className="storage-manager">
      {warning && (
        <div className="storage-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{warning}</span>
        </div>
      )}
      
      <div className="storage-summary" onClick={() => setShowDetails(!showDetails)}>
        <div className="storage-title">
          <h3>Local Storage</h3>
          <span className={`toggle-icon ${showDetails ? 'open' : ''}`}>▼</span>
        </div>
        
        {stats && (
          <div className="storage-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculatePercentage(stats.totalSize, limits.TOTAL)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {formatBytes(stats.totalSize)} / {formatBytes(limits.TOTAL)}
            </div>
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="storage-details">
          {stats && (
            <div className="storage-stats">
              <div className="stat-item">
                <div className="stat-label">Chat Messages</div>
                <div className="stat-value">{formatBytes(stats.chatMessagesSize)}</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${calculatePercentage(stats.chatMessagesSize, limits.CHAT_MESSAGES)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Images</div>
                <div className="stat-value">
                  {formatBytes(stats.uploadedImagesSize + stats.generatedImagesSize)}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${calculatePercentage(
                        stats.uploadedImagesSize + stats.generatedImagesSize, 
                        limits.IMAGES
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">Last Updated</div>
                <div className="stat-value">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          <div className="storage-actions">
            <div className="import-container">
              <input 
                type="file" 
                id="import-file" 
                accept=".json" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }}
              />
              <label htmlFor="import-file" className="btn btn-secondary">
                Select File
              </label>
              {importFile && (
                <>
                  <span className="file-name">{importFile.name}</span>
                  <button className="btn btn-primary" onClick={handleImport}>
                    Import
                  </button>
                </>
              )}
            </div>
            
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleExport}>
                Export Data
              </button>
              <button className="btn btn-danger" onClick={handleClearAll}>
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageManager;