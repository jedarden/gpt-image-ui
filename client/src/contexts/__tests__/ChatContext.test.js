import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatProvider, ChatContext } from '../ChatContext';
import api from '../../utils/api';

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

// Mock api
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

// Test component that uses ChatContext
const TestComponent = () => {
  const {
    messages,
    uploadedImages,
    maskedImages,
    isLoading,
    error,
    hasMoreMessages,
    sendMessage,
    uploadImage,
    removeUploadedImage,
    addMaskedImage,
    removeMaskedImage,
    retryMessage,
    clearChat,
    fetchChatHistory
  } = React.useContext(ChatContext);
  
  return (
    <div>
      <div data-testid="messages">{JSON.stringify(messages)}</div>
      <div data-testid="uploaded-images">{JSON.stringify(uploadedImages)}</div>
      <div data-testid="masked-images">{JSON.stringify(maskedImages)}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="has-more-messages">{hasMoreMessages.toString()}</div>
      
      <button data-testid="send-message" onClick={() => sendMessage('Hello')}>
        Send Message
      </button>
      
      <button 
        data-testid="upload-image" 
        onClick={() => uploadImage({ url: 'image-url', data: 'image-data' })}
      >
        Upload Image
      </button>
      
      <button 
        data-testid="remove-uploaded-image" 
        onClick={() => removeUploadedImage('image-id')}
      >
        Remove Uploaded Image
      </button>
      
      <button 
        data-testid="add-masked-image" 
        onClick={() => addMaskedImage({ url: 'masked-url', mask: 'mask-data' })}
      >
        Add Masked Image
      </button>
      
      <button 
        data-testid="remove-masked-image" 
        onClick={() => removeMaskedImage('masked-id')}
      >
        Remove Masked Image
      </button>
      
      <button 
        data-testid="retry-message" 
        onClick={() => retryMessage('message-id')}
      >
        Retry Message
      </button>
      
      <button data-testid="clear-chat" onClick={clearChat}>
        Clear Chat
      </button>
      
      <button data-testid="fetch-history" onClick={fetchChatHistory}>
        Fetch History
      </button>
    </div>
  );
};

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Date.now() for consistent timestamps
    jest.spyOn(Date, 'now').mockImplementation(() => 1609459200000); // 2021-01-01
    
    // Mock successful API responses
    api.get.mockResolvedValue({
      data: {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: '2021-01-01T00:00:00.000Z'
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hi there!',
            timestamp: '2021-01-01T00:00:01.000Z'
          }
        ],
        hasMore: true
      }
    });
    
    api.post.mockResolvedValue({
      data: {
        userMessage: {
          id: 'user-msg-id',
          role: 'user',
          content: 'Hello',
          timestamp: '2021-01-01T00:00:00.000Z'
        },
        assistantMessage: {
          id: 'assistant-msg-id',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: '2021-01-01T00:00:01.000Z'
        }
      }
    });
    
    api.delete.mockResolvedValue({ data: { success: true } });
  });
  
  it('should fetch chat history on mount', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Check that the API was called
    expect(api.get).toHaveBeenCalledWith('/api/chat/history', { params: {} });
    
    // Wait for state to update
    await waitFor(() => {
      const messagesElement = screen.getByTestId('messages');
      expect(messagesElement).toHaveTextContent('msg-1');
      expect(messagesElement).toHaveTextContent('msg-2');
    });
    
    // Check that hasMoreMessages is set correctly
    expect(screen.getByTestId('has-more-messages')).toHaveTextContent('true');
  });
  
  it('should send a message and update state', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message').click();
    });
    
    // Check that the API was called with the correct payload
    expect(api.post).toHaveBeenCalledWith('/api/chat/message', {
      content: 'Hello',
      images: []
    });
    
    // Check that the messages state was updated
    await waitFor(() => {
      const messagesElement = screen.getByTestId('messages');
      expect(messagesElement).toHaveTextContent('user-msg-id');
      expect(messagesElement).toHaveTextContent('assistant-msg-id');
    });
  });
  
  it('should handle message send failure', async () => {
    // Mock API error
    api.post.mockRejectedValueOnce(new Error('API error'));
    
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Send a message
    await act(async () => {
      screen.getByTestId('send-message').click();
    });
    
    // Check that the error state was updated
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to send message');
    });
    
    // Check that the message status was updated to FAILED
    await waitFor(() => {
      const messagesElement = screen.getByTestId('messages');
      expect(messagesElement).toHaveTextContent('FAILED');
    });
  });
  
  it('should upload and remove images', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Upload an image
    await act(async () => {
      screen.getByTestId('upload-image').click();
    });
    
    // Check that the uploadedImages state was updated
    await waitFor(() => {
      const uploadedImagesElement = screen.getByTestId('uploaded-images');
      expect(uploadedImagesElement).toHaveTextContent('mock-uuid');
      expect(uploadedImagesElement).toHaveTextContent('image-url');
    });
    
    // Remove an uploaded image
    await act(async () => {
      screen.getByTestId('remove-uploaded-image').click();
    });
    
    // Check that the image was removed
    await waitFor(() => {
      const uploadedImagesElement = screen.getByTestId('uploaded-images');
      expect(uploadedImagesElement).toHaveTextContent('[]');
    });
  });
  
  it('should add and remove masked images', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Add a masked image
    await act(async () => {
      screen.getByTestId('add-masked-image').click();
    });
    
    // Check that the maskedImages state was updated
    await waitFor(() => {
      const maskedImagesElement = screen.getByTestId('masked-images');
      expect(maskedImagesElement).toHaveTextContent('mock-uuid');
      expect(maskedImagesElement).toHaveTextContent('masked-url');
    });
    
    // Remove a masked image
    await act(async () => {
      screen.getByTestId('remove-masked-image').click();
    });
    
    // Check that the image was removed
    await waitFor(() => {
      const maskedImagesElement = screen.getByTestId('masked-images');
      expect(maskedImagesElement).toHaveTextContent('[]');
    });
  });
  
  it('should clear chat history', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Clear chat
    await act(async () => {
      screen.getByTestId('clear-chat').click();
    });
    
    // Check that the API was called
    expect(api.delete).toHaveBeenCalledWith('/api/chat/history');
    
    // Check that the messages state was cleared
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('[]');
    });
    
    // Check that hasMoreMessages is set to false
    expect(screen.getByTestId('has-more-messages')).toHaveTextContent('false');
  });
  
  it('should handle clear chat failure', async () => {
    // Mock API error
    api.delete.mockRejectedValueOnce(new Error('API error'));
    
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Clear chat
    await act(async () => {
      screen.getByTestId('clear-chat').click();
    });
    
    // Check that the error state was updated
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to clear chat history');
    });
  });
  
  it('should fetch more messages when hasMoreMessages is true', async () => {
    // Mock second page of messages
    api.get.mockResolvedValueOnce({
      data: {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: '2021-01-01T00:00:00.000Z'
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hi there!',
            timestamp: '2021-01-01T00:00:01.000Z'
          }
        ],
        hasMore: true
      }
    }).mockResolvedValueOnce({
      data: {
        messages: [
          {
            id: 'msg-3',
            role: 'user',
            content: 'How are you?',
            timestamp: '2020-12-31T00:00:00.000Z'
          },
          {
            id: 'msg-4',
            role: 'assistant',
            content: 'I am fine, thank you!',
            timestamp: '2020-12-31T00:00:01.000Z'
          }
        ],
        hasMore: false
      }
    });
    
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Fetch more messages
    await act(async () => {
      screen.getByTestId('fetch-history').click();
    });
    
    // Check that the API was called with the correct params
    expect(api.get).toHaveBeenCalledWith('/api/chat/history', { params: { before: 'msg-2' } });
    
    // Check that the messages state was updated
    await waitFor(() => {
      const messagesElement = screen.getByTestId('messages');
      expect(messagesElement).toHaveTextContent('msg-3');
      expect(messagesElement).toHaveTextContent('msg-4');
    });
    
    // Check that hasMoreMessages is set to false
    expect(screen.getByTestId('has-more-messages')).toHaveTextContent('false');
  });
  
  it('should handle fetch history failure', async () => {
    // Mock API error for second call
    api.get.mockResolvedValueOnce({
      data: {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: '2021-01-01T00:00:00.000Z'
          }
        ],
        hasMore: true
      }
    }).mockRejectedValueOnce(new Error('API error'));
    
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );
    
    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('messages')).toHaveTextContent('msg-1');
    });
    
    // Fetch more messages
    await act(async () => {
      screen.getByTestId('fetch-history').click();
    });
    
    // Check that the error state was updated
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load chat history');
    });
  });
});