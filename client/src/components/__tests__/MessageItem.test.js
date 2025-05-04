import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageItem from '../MessageItem';

// Mock child components
jest.mock('../TextMessage', () => ({ content }) => (
  <div data-testid="text-message">{content}</div>
));

jest.mock('../ImageMessage', () => ({ image }) => (
  <div data-testid="image-message" data-image-id={image.id}>
    Image: {image.id}
  </div>
));

describe('MessageItem Component', () => {
  // Mock date for consistent timestamp formatting
  const originalDate = global.Date;
  
  beforeAll(() => {
    // Mock Date to return a fixed timestamp
    const mockDate = new Date('2023-01-01T12:34:56Z');
    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return new originalDate(date);
        }
        return mockDate;
      }
      
      static now() {
        return mockDate.getTime();
      }
    };
  });
  
  afterAll(() => {
    // Restore original Date
    global.Date = originalDate;
  });
  
  it('should render a user message with text content', () => {
    const message = {
      role: 'user',
      content: 'Hello, world!',
      timestamp: '2023-01-01T12:34:56Z'
    };
    
    render(<MessageItem message={message} />);
    
    // Check role label
    expect(screen.getByText('You')).toBeInTheDocument();
    
    // Check timestamp
    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
    
    // Check message content
    expect(screen.getByTestId('text-message')).toHaveTextContent('Hello, world!');
    
    // Check CSS classes
    const messageItem = screen.getByText('You').closest('.message-item');
    expect(messageItem).toHaveClass('user');
  });
  
  it('should render an AI message with text content', () => {
    const message = {
      role: 'assistant',
      content: 'I am an AI assistant.',
      timestamp: '2023-01-01T12:35:00Z'
    };
    
    render(<MessageItem message={message} />);
    
    // Check role label
    expect(screen.getByText('AI')).toBeInTheDocument();
    
    // Check timestamp
    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    expect(screen.getByText(formattedTime)).toBeInTheDocument();
    
    // Check message content
    expect(screen.getByTestId('text-message')).toHaveTextContent('I am an AI assistant.');
    
    // Check CSS classes
    const messageItem = screen.getByText('AI').closest('.message-item');
    expect(messageItem).toHaveClass('assistant');
  });
  
  it('should render a message with images', () => {
    const message = {
      role: 'user',
      content: 'Check out these images:',
      timestamp: '2023-01-01T12:36:00Z',
      images: [
        { id: 'image-1', url: 'image-1-url' },
        { id: 'image-2', url: 'image-2-url' }
      ]
    };
    
    render(<MessageItem message={message} />);
    
    // Check text content
    expect(screen.getByTestId('text-message')).toHaveTextContent('Check out these images:');
    
    // Check images
    const imageMessages = screen.getAllByTestId('image-message');
    expect(imageMessages).toHaveLength(2);
    expect(imageMessages[0]).toHaveAttribute('data-image-id', 'image-1');
    expect(imageMessages[1]).toHaveAttribute('data-image-id', 'image-2');
  });
  
  it('should render a message with pending status', () => {
    const message = {
      role: 'user',
      content: 'Sending a message...',
      timestamp: '2023-01-01T12:37:00Z',
      status: 'PENDING'
    };
    
    render(<MessageItem message={message} />);
    
    // Check pending status indicator
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    
    // Check CSS classes
    const messageItem = screen.getByText('You').closest('.message-item');
    expect(messageItem).toHaveClass('pending');
  });
  
  it('should render a message with failed status', () => {
    const message = {
      role: 'user',
      content: 'Failed message',
      timestamp: '2023-01-01T12:38:00Z',
      status: 'FAILED'
    };
    
    render(<MessageItem message={message} />);
    
    // Check failed status indicator
    expect(screen.getByText('Failed to send. Tap to retry.')).toBeInTheDocument();
    
    // Check CSS classes
    const messageItem = screen.getByText('You').closest('.message-item');
    expect(messageItem).toHaveClass('failed');
  });
  
  it('should render a message without content but with images', () => {
    const message = {
      role: 'user',
      timestamp: '2023-01-01T12:39:00Z',
      images: [
        { id: 'image-3', url: 'image-3-url' }
      ]
    };
    
    render(<MessageItem message={message} />);
    
    // Check that there's no text message
    expect(screen.queryByTestId('text-message')).not.toBeInTheDocument();
    
    // Check image
    const imageMessage = screen.getByTestId('image-message');
    expect(imageMessage).toHaveAttribute('data-image-id', 'image-3');
  });
  
  it('should handle messages without timestamp', () => {
    const message = {
      role: 'user',
      content: 'No timestamp'
    };
    
    render(<MessageItem message={message} />);
    
    // Component should render without errors
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByTestId('text-message')).toHaveTextContent('No timestamp');
  });
});