import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from '../ChatContainer';
import { ChatContext } from '../../contexts/ChatContext';
import { AuthContext } from '../../contexts/AuthContext';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe(element) {
    this.element = element;
  }
  
  disconnect() {
    this.element = null;
  }
  
  // Helper method to simulate intersection
  simulateIntersection(isIntersecting) {
    this.callback([
      {
        isIntersecting,
        target: this.element
      }
    ]);
  }
};

describe('ChatContainer Component', () => {
  // Mock context values
  const mockChatContext = {
    messages: [],
    isLoading: false,
    error: null,
    hasMoreMessages: false,
    fetchChatHistory: jest.fn()
  };
  
  const mockAuthContext = {
    isAuthenticated: true
  };
  
  // Helper function to render with contexts
  const renderWithContexts = (chatContextOverrides = {}, authContextOverrides = {}) => {
    const chatContextValue = { ...mockChatContext, ...chatContextOverrides };
    const authContextValue = { ...mockAuthContext, ...authContextOverrides };
    
    return render(
      <AuthContext.Provider value={authContextValue}>
        <ChatContext.Provider value={chatContextValue}>
          <ChatContainer />
        </ChatContext.Provider>
      </AuthContext.Provider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render empty state when no messages and user is authenticated', () => {
    renderWithContexts();
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation by sending a message below.')).toBeInTheDocument();
  });
  
  it('should render auth prompt when user is not authenticated', () => {
    renderWithContexts({}, { isAuthenticated: false });
    
    expect(screen.getByText('Welcome to GPT Image UI')).toBeInTheDocument();
    expect(screen.getByText('Please log in to start chatting and generating images.')).toBeInTheDocument();
  });
  
  it('should render loading indicator when loading messages', () => {
    renderWithContexts({ isLoading: true });
    
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });
  
  it('should render error message when there is an error', () => {
    const errorMessage = 'Failed to load messages';
    renderWithContexts({ error: errorMessage });
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  it('should render messages when available', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello', timestamp: '2023-01-01T00:00:00.000Z' },
      { id: '2', role: 'assistant', content: 'Hi there!', timestamp: '2023-01-01T00:00:01.000Z' }
    ];
    
    renderWithContexts({ messages });
    
    // We're not testing MessageList component in detail here, just that it receives the messages
    // The actual message rendering is tested in MessageList.test.js
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
  });
  
  it('should render scroll sentinel when more messages are available', () => {
    renderWithContexts({ hasMoreMessages: true });
    
    const sentinel = document.querySelector('.scroll-sentinel');
    expect(sentinel).toBeInTheDocument();
  });
  
  it('should fetch more messages when scroll sentinel is intersecting', async () => {
    renderWithContexts({ hasMoreMessages: true });
    
    // Get the IntersectionObserver instance
    const observer = global.IntersectionObserver.prototype;
    
    // Simulate intersection
    observer.simulateIntersection(true);
    
    // Check that fetchChatHistory was called
    await waitFor(() => {
      expect(mockChatContext.fetchChatHistory).toHaveBeenCalled();
    });
  });
  
  it('should not fetch more messages when loading', async () => {
    renderWithContexts({ hasMoreMessages: true, isLoading: true });
    
    // Get the IntersectionObserver instance
    const observer = global.IntersectionObserver.prototype;
    
    // Simulate intersection
    observer.simulateIntersection(true);
    
    // Wait a bit to ensure fetchChatHistory is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that fetchChatHistory was not called
    expect(mockChatContext.fetchChatHistory).not.toHaveBeenCalled();
  });
  
  it('should not fetch more messages when there are no more messages', async () => {
    renderWithContexts({ hasMoreMessages: false });
    
    // Get the IntersectionObserver instance
    const observer = global.IntersectionObserver.prototype;
    
    // Simulate intersection
    observer.simulateIntersection(true);
    
    // Wait a bit to ensure fetchChatHistory is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that fetchChatHistory was not called
    expect(mockChatContext.fetchChatHistory).not.toHaveBeenCalled();
  });
  
  it('should disconnect observer on unmount', () => {
    const { unmount } = renderWithContexts({ hasMoreMessages: true });
    
    // Spy on disconnect method
    const disconnectSpy = jest.spyOn(global.IntersectionObserver.prototype, 'disconnect');
    
    // Unmount the component
    unmount();
    
    // Check that disconnect was called
    expect(disconnectSpy).toHaveBeenCalled();
  });
});