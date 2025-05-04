import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight to fit content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };
  
  return (
    <div className="message-input">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isLoading}
        rows={1}
      />
      
      <button 
        className={`send-button ${isLoading ? 'loading' : ''}`}
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        aria-label="Send message"
      >
        {isLoading ? (
          <div className="spinner small"></div>
        ) : (
          <span>Send</span>
        )}
      </button>
    </div>
  );
};

export default MessageInput;