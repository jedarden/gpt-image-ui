/**
 * End-to-End Test for Chat Functionality
 * 
 * Tests the complete user flow for chat interactions, including:
 * - Sending messages
 * - Receiving responses
 * - Loading chat history
 * - Handling errors
 */

const { setup, teardown, createPage, frontendUrl } = require('./setup');

// Mock data for OpenAI API responses
const mockResponses = {
  chatCompletion: {
    id: 'chatcmpl-mock-id',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4-vision-preview',
    choices: [
      {
        message: {
          role: 'assistant',
          content: 'This is a mock response from the AI assistant.'
        },
        index: 0,
        finish_reason: 'stop'
      }
    ]
  }
};

// Test timeout (2 minutes)
jest.setTimeout(120000);

describe('Chat Functionality', () => {
  let page;
  
  // Setup before all tests
  beforeAll(async () => {
    await setup();
  });
  
  // Teardown after all tests
  afterAll(async () => {
    await teardown();
  });
  
  // Setup before each test
  beforeEach(async () => {
    page = await createPage();
    
    // Mock OpenAI API responses
    await page.setRequestInterception(true);
    
    page.on('request', async (request) => {
      const url = request.url();
      
      // Mock OpenAI API requests
      if (url.includes('api.openai.com')) {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.chatCompletion)
        });
      } else {
        // Let other requests through
        await request.continue();
      }
    });
    
    // Navigate to the app
    await page.goto(frontendUrl);
    
    // Wait for the app to load
    await page.waitForSelector('.chat-container');
  });
  
  // Cleanup after each test
  afterEach(async () => {
    await page.close();
  });
  
  it('should send a message and receive a response', async () => {
    // Type a message
    await page.type('.message-input textarea', 'Hello, world!');
    
    // Click the send button
    await page.click('.message-input button[type="submit"]');
    
    // Wait for the user message to appear
    await page.waitForSelector('.message-item.user');
    
    // Check that the user message contains the correct text
    const userMessageText = await page.$eval('.message-item.user .message-content', el => el.textContent);
    expect(userMessageText).toContain('Hello, world!');
    
    // Wait for the assistant message to appear
    await page.waitForSelector('.message-item.assistant');
    
    // Check that the assistant message contains the response
    const assistantMessageText = await page.$eval('.message-item.assistant .message-content', el => el.textContent);
    expect(assistantMessageText).toContain('This is a mock response from the AI assistant.');
  });
  
  it('should display loading indicator while waiting for response', async () => {
    // Slow down the response
    page.on('request', async (request) => {
      const url = request.url();
      
      if (url.includes('api.openai.com')) {
        // Delay the response by 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockResponses.chatCompletion)
        });
      } else {
        await request.continue();
      }
    });
    
    // Type a message
    await page.type('.message-input textarea', 'Slow response test');
    
    // Click the send button
    await page.click('.message-input button[type="submit"]');
    
    // Check that the loading indicator appears
    await page.waitForSelector('.loading-indicator');
    
    // Wait for the assistant message to appear
    await page.waitForSelector('.message-item.assistant');
    
    // Check that the loading indicator disappears
    const loadingIndicator = await page.$('.loading-indicator');
    expect(loadingIndicator).toBeNull();
  });
  
  it('should handle errors when sending messages', async () => {
    // Mock a failed API request
    page.on('request', async (request) => {
      const url = request.url();
      
      if (url.includes('api/chat/message')) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: 'Internal Server Error',
              code: 'INTERNAL_ERROR'
            }
          })
        });
      } else {
        await request.continue();
      }
    });
    
    // Type a message
    await page.type('.message-input textarea', 'This will cause an error');
    
    // Click the send button
    await page.click('.message-input button[type="submit"]');
    
    // Wait for the error message to appear
    await page.waitForSelector('.error-message');
    
    // Check that the error message contains the correct text
    const errorText = await page.$eval('.error-message', el => el.textContent);
    expect(errorText).toContain('Failed to send message');
  });
  
  it('should load chat history', async () => {
    // Mock chat history API response
    page.on('request', async (request) => {
      const url = request.url();
      
      if (url.includes('api/chat/history')) {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            messages: [
              {
                id: 'hist-msg-1',
                role: 'user',
                content: 'Previous message',
                timestamp: new Date().toISOString()
              },
              {
                id: 'hist-msg-2',
                role: 'assistant',
                content: 'Previous response',
                timestamp: new Date().toISOString()
              }
            ],
            hasMore: false
          })
        });
      } else {
        await request.continue();
      }
    });
    
    // Reload the page to trigger history fetch
    await page.reload();
    
    // Wait for the chat container to load
    await page.waitForSelector('.chat-container');
    
    // Wait for the history messages to appear
    await page.waitForSelector('.message-item.user');
    await page.waitForSelector('.message-item.assistant');
    
    // Check that the history messages contain the correct text
    const userMessageText = await page.$eval('.message-item.user .message-content', el => el.textContent);
    expect(userMessageText).toContain('Previous message');
    
    const assistantMessageText = await page.$eval('.message-item.assistant .message-content', el => el.textContent);
    expect(assistantMessageText).toContain('Previous response');
  });
  
  it('should clear chat history', async () => {
    // Mock chat history API response
    page.on('request', async (request) => {
      const url = request.url();
      
      if (url.includes('api/chat/history') && request.method() === 'DELETE') {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      } else if (url.includes('api/chat/history') && request.method() === 'GET') {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            messages: [],
            hasMore: false
          })
        });
      } else {
        await request.continue();
      }
    });
    
    // Add some messages first
    await page.type('.message-input textarea', 'Message to be cleared');
    await page.click('.message-input button[type="submit"]');
    await page.waitForSelector('.message-item.user');
    
    // Click the clear chat button (assuming it's in the control panel)
    await page.click('.control-panel button.clear-chat');
    
    // Wait for confirmation dialog and confirm
    await page.waitForSelector('.confirmation-dialog');
    await page.click('.confirmation-dialog button.confirm');
    
    // Check that the messages are cleared
    await page.waitForSelector('.empty-state');
    const emptyStateText = await page.$eval('.empty-state', el => el.textContent);
    expect(emptyStateText).toContain('No messages yet');
  });
});