import React, { createContext, useState, useEffect } from 'react';
import storageUtils from '../utils/storageUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Configuration state
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      setIsLoading(true);
      
      // Load settings from localStorage
      const savedSettings = storageUtils.loadFromStorage(
        storageUtils.STORAGE_KEYS.SETTINGS,
        {}
      );
      
      setSettings(savedSettings);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update settings
  const updateSettings = (newSettings) => {
    try {
      // Merge new settings with existing ones
      const updatedSettings = { ...settings, ...newSettings };
      
      // Save to localStorage
      storageUtils.saveToStorage(
        storageUtils.STORAGE_KEYS.SETTINGS,
        updatedSettings
      );
      
      // Update state
      setSettings(updatedSettings);
      
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      return false;
    }
  };
  
  // For backward compatibility, always return isAuthenticated as true
  // This allows existing components to work without modification
  const isAuthenticated = true;
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        settings,
        updateSettings,
        // For backward compatibility
        user: null,
        error: null,
        login: () => Promise.resolve(true),
        register: () => Promise.resolve(true),
        logout: () => Promise.resolve(),
        checkAuthStatus: loadSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};