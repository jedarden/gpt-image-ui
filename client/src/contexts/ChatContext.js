import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import api from '../utils/api';
import storageUtils from '../utils/storageUtils';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [maskedImages, setMaskedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [storageWarning, setStorageWarning] = useState(null);
  
  // Load chat history from localStorage on mount
  useEffect(() => {
    loadChatHistory();
  }, []);
  
  // Save chat history to localStorage
  const saveChatHistory = useCallback(() => {
    try {
      // Check if adding this data would exceed storage limits
      if (storageUtils.wouldExceedStorageLimits(
        storageUtils.STORAGE_KEYS.CHAT_MESSAGES,
        messages
      )) {
        // If it would exceed, show warning but still try to save
        setStorageWarning('Chat history is approaching storage limits. Consider exporting and clearing some messages.');
      } else {
        setStorageWarning(null);
      }
      
      // Save messages to localStorage
      storageUtils.saveToStorage(
        storageUtils.STORAGE_KEYS.CHAT_MESSAGES,
        messages
      );
    } catch (err) {
      console.error('Error saving chat history:', err);
      setError('Failed to save chat history to local storage.');
    }
  }, [messages]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, saveChatHistory]);
  
  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load messages from localStorage
      const savedMessages = storageUtils.loadFromStorage(
        storageUtils.STORAGE_KEYS.CHAT_MESSAGES,
        []
      );
      
      if (savedMessages && savedMessages.length > 0) {
        // Ensure each message has an images property
        const processedMessages = savedMessages.map(msg => ({
          ...msg,
          images: msg.images || []
        }));
        
        // Log for debugging
        console.log('Loaded messages from localStorage:', processedMessages);
        
        setMessages(processedMessages);
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError('Failed to load chat history from local storage.');
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch more chat history (for pagination)
  const fetchChatHistory = useCallback(() => {
    // In the browser-only version, we load all messages at once
    // This is kept for API compatibility with the original component
    loadChatHistory();
  }, []);
  
  // Send a message to the API
  const sendMessage = async (content) => {
    // Create a temporary message
    const tempId = uuidv4();
    let userMessage = {
      id: tempId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    };
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to state
      setMessages(prevMessages => [userMessage, ...prevMessages]);
      
      // Prepare request payload
      const payload = {
        content,
        images: [...uploadedImages, ...maskedImages]
      };
      
      // Send request to API
      const response = await api.post('/chat/message', payload);
      
      // Log the response data for debugging
      console.log('Chat API response:', {
        hasImages: response.data.assistantMessage.images && response.data.assistantMessage.images.length > 0,
        imageCount: response.data.assistantMessage.images ? response.data.assistantMessage.images.length : 0,
        content: response.data.assistantMessage.content,
        firstImageUrl: response.data.assistantMessage.images && response.data.assistantMessage.images.length > 0
          ? response.data.assistantMessage.images[0].url.substring(0, 30) + '...'
          : 'No image URL'
      });
      
      // Update user message with server response
      const { userMessage: updatedUserMessage, assistantMessage } = response.data;
      
      // Add explicit logging to verify the structure of the assistantMessage object
      console.log('Assistant message from server:', assistantMessage);
      console.log('Images in assistant message:', assistantMessage.images);
      
      // Ensure the images property is properly included when updating the messages state
      const processedAssistantMessage = {
        ...assistantMessage,
        images: assistantMessage.images || [] // Ensure images property exists
      };
      
      setMessages(prevMessages => {
        // Replace temporary message with server response
        const updatedMessages = prevMessages.filter(msg => msg.id !== tempId);
        return [processedAssistantMessage, updatedUserMessage, ...updatedMessages];
      });
      
      // Clear uploaded and masked images
      setUploadedImages([]);
      setMaskedImages([]);
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Update temporary message to show error
      setMessages(prevMessages => {
        return prevMessages.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'FAILED' }
            : msg
        );
      });
      
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Upload an image
  const uploadImage = (image) => {
    const imageWithId = {
      ...image,
      id: uuidv4()
    };
    
    setUploadedImages(prevImages => [...prevImages, imageWithId]);
  };
  
  // Remove an uploaded image
  const removeUploadedImage = (imageId) => {
    setUploadedImages(prevImages =>
      prevImages.filter(img => img.id !== imageId)
    );
  };
  
  // Add a masked image for inpainting
  const addMaskedImage = (maskedImage) => {
    const maskedImageWithId = {
      ...maskedImage,
      id: uuidv4()
    };
    
    setMaskedImages(prevImages => [...prevImages, maskedImageWithId]);
  };
  
  // Remove a masked image
  const removeMaskedImage = (imageId) => {
    setMaskedImages(prevImages =>
      prevImages.filter(img => img.id !== imageId)
    );
  };
  
  // Retry a failed message
  const retryMessage = async (messageId) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    
    if (!failedMessage) return;
    
    // Remove the failed message
    setMessages(prevMessages =>
      prevMessages.filter(msg => msg.id !== messageId)
    );
    
    // Resend the message
    await sendMessage(failedMessage.content);
  };
  
  // Clear chat history
  const clearChat = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear messages from state
      setMessages([]);
      setHasMoreMessages(false);
      
      // Clear messages from localStorage
      storageUtils.clearStorage(storageUtils.STORAGE_KEYS.CHAT_MESSAGES);
      
      setStorageWarning(null);
    } catch (err) {
      console.error('Error clearing chat history:', err);
      setError('Failed to clear chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Export chat history
  const exportChatHistory = () => {
    try {
      const dataUri = storageUtils.exportData();
      
      if (dataUri) {
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUri;
        downloadLink.download = `gpt-image-ui-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (err) {
      console.error('Error exporting chat history:', err);
      setError('Failed to export chat history. Please try again.');
    }
  };
  
  // Import chat history
  const importChatHistory = (importData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import data
      const success = storageUtils.importData(importData);
      
      if (success) {
        // Reload chat history
        loadChatHistory();
      } else {
        setError('Failed to import chat history. Invalid data format.');
      }
    } catch (err) {
      console.error('Error importing chat history:', err);
      setError('Failed to import chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        uploadedImages,
        maskedImages,
        isLoading,
        error,
        hasMoreMessages,
        storageWarning,
        sendMessage,
        uploadImage,
        removeUploadedImage,
        addMaskedImage,
        removeMaskedImage,
        retryMessage,
        clearChat,
        fetchChatHistory,
        exportChatHistory,
        importChatHistory
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};