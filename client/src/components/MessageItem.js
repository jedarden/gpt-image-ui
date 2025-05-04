import React from 'react';
import './MessageItem.css';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';

const MessageItem = ({ message }) => {
  const { role, content, timestamp, images, status } = message;
  
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine if message has images
  const hasImages = images && images.length > 0;
  
  return (
    <div className={`message-item ${role} ${status ? status.toLowerCase() : ''}`}>
      <div className="message-header">
        <span className="message-role">
          {role === 'user' ? 'You' : 'AI'}
        </span>
        <span className="message-time">{formattedTime}</span>
      </div>
      
      <div className="message-content">
        {/* Text content */}
        {content && <TextMessage content={content} />}
        
        {/* Image content */}
        {hasImages && (
          <div className="message-images">
            {images.map((image) => (
              <ImageMessage key={image.id} image={image} />
            ))}
          </div>
        )}
        
        {/* Status indicator for pending or failed messages */}
        {status === 'PENDING' && (
          <div className="message-status pending">
            <div className="spinner small"></div>
            <span>Sending...</span>
          </div>
        )}
        
        {status === 'FAILED' && (
          <div className="message-status failed">
            <span>Failed to send. Tap to retry.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;