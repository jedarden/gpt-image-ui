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
  
  // Debug logging for message structure
  console.log('Message structure:', {
    id: message.id,
    role,
    hasContent: !!content,
    contentLength: content ? content.length : 0,
    hasImages,
    imageCount: images ? images.length : 0,
    firstImageUrl: hasImages ? (images[0].url ? images[0].url.substring(0, 20) + '...' : 'No URL') : 'No images'
  });
  
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
          <div className="message-images" style={{ marginTop: '10px' }}>
            {images.map((image) => (
              <ImageMessage key={image.id || Math.random().toString(36).substring(7)} image={image} />
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