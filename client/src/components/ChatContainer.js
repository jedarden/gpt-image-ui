import React, { useContext, useEffect, useRef } from 'react';
import './ChatContainer.css';
import MessageList from './MessageList';
import { ChatContext } from '../contexts/ChatContext';
import { AuthContext } from '../contexts/AuthContext';

const ChatContainer = () => {
  const { messages, isLoading, error, hasMoreMessages, fetchChatHistory } = useContext(ChatContext);
  const { isAuthenticated } = useContext(AuthContext);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (!isAuthenticated || !hasMoreMessages) return;

    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading && hasMoreMessages) {
        fetchChatHistory();
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);
    
    const sentinel = document.querySelector('.scroll-sentinel');
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isAuthenticated, hasMoreMessages, isLoading, fetchChatHistory]);

  return (
    <div className="chat-container" ref={containerRef}>
      {isAuthenticated ? (
        <>
          {error && <div className="error-message">{error}</div>}
          
          <MessageList messages={messages} />
          
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          )}
          
          {hasMoreMessages && <div className="scroll-sentinel"></div>}
          
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <h2>No messages yet</h2>
              <p>Start a conversation by sending a message below.</p>
            </div>
          )}
        </>
      ) : (
        <div className="auth-prompt">
          <h2>Welcome to GPT Image UI</h2>
          <p>Please log in to start chatting and generating images.</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;