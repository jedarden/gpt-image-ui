import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../MessageInput';

describe('MessageInput', () => {
  const mockOnSend = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render the input field and send button', () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
  
  it('should update the input value when typing', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Hello, world!');
    
    expect(input.value).toBe('Hello, world!');
  });
  
  it('should call onSend when clicking the send button', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    await userEvent.type(input, 'Hello, world!');
    await userEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello, world!');
    expect(input.value).toBe(''); // Input should be cleared after sending
  });
  
  it('should call onSend when pressing Enter', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await userEvent.type(input, 'Hello, world!');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello, world!');
    expect(input.value).toBe(''); // Input should be cleared after sending
  });
  
  it('should not call onSend when pressing Shift+Enter', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    await userEvent.type(input, 'Hello, world!');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(input.value).toBe('Hello, world!'); // Input should not be cleared
  });
  
  it('should disable the input and button when loading', () => {
    render(<MessageInput onSend={mockOnSend} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(sendButton).toHaveClass('loading');
  });
  
  it('should disable the send button when input is empty', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Initially the button should be disabled
    expect(sendButton).toBeDisabled();
    
    // Type something
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Hello');
    
    // Now the button should be enabled
    expect(sendButton).not.toBeDisabled();
    
    // Clear the input
    await userEvent.clear(input);
    
    // Button should be disabled again
    expect(sendButton).toBeDisabled();
  });
  
  it('should not call onSend when input is empty', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Try to send with empty input
    await userEvent.click(sendButton);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });
  
  it('should not call onSend when input contains only whitespace', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Type only spaces
    await userEvent.type(input, '   ');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });
  
  it('should not call onSend when loading', async () => {
    render(<MessageInput onSend={mockOnSend} isLoading={true} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Try to send while loading
    await userEvent.type(input, 'Hello, world!');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });
  
  it('should show a spinner when loading', () => {
    render(<MessageInput onSend={mockOnSend} isLoading={true} />);
    
    expect(screen.getByText('Send')).not.toBeVisible();
    expect(screen.getByRole('button', { name: /send message/i }).querySelector('.spinner')).toBeInTheDocument();
  });
});