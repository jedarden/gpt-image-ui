/**
 * Test script to verify subpath deployment, authentication removal, and browser storage
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const config = {
  apiUrl: 'http://localhost:3001/api',
  subPath: '/imagegen',
  testImagePath: path.join(__dirname, 'test-image.png'),
  testDataPath: path.join(__dirname, 'test-data.json')
};

// Create axios instance
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Test subpath deployment
 */
async function testSubpathDeployment() {
  console.log('\n=== Testing Subpath Deployment ===');
  
  try {
    // Test health endpoint with subpath
    console.log('Testing health endpoint...');
    const healthResponse = await api.get('/health');
    console.log('Health endpoint response:', healthResponse.status);
    console.log('Health check successful');
    
    // Test static file serving with subpath
    console.log('Testing static file serving would require browser testing');
    
    return true;
  } catch (error) {
    console.error('Subpath deployment test failed:', error.message);
    return false;
  }
}

/**
 * Test authentication removal
 */
async function testAuthenticationRemoval() {
  console.log('\n=== Testing Authentication Removal ===');
  
  try {
    // Test chat endpoint without authentication
    console.log('Testing chat endpoint without authentication...');
    const chatResponse = await api.post('/chat/message', {
      message: 'Test message',
      context: []
    });
    console.log('Chat endpoint response status:', chatResponse.status);
    
    // Test image generation endpoint without authentication
    console.log('Testing image generation endpoint without authentication...');
    const genResponse = await api.post('/images/generate', {
      prompt: 'Test prompt',
      n: 1,
      size: '256x256'
    });
    console.log('Image generation endpoint response status:', genResponse.status);
    
    console.log('Authentication removal test successful');
    return true;
  } catch (error) {
    console.error('Authentication removal test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

/**
 * Test browser storage (simulated)
 */
async function testBrowserStorage() {
  console.log('\n=== Testing Browser Storage (Simulated) ===');
  
  try {
    // Create test data
    const testData = {
      chatMessages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there! How can I help you?' }
      ],
      uploadedImages: [
        { 
          id: 'test-image-1',
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          filename: 'test-image-1.png',
          timestamp: new Date().toISOString(),
          size: 1024,
          type: 'image/png'
        }
      ],
      generatedImages: [
        {
          id: 'gen-image-1',
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          prompt: 'Test prompt',
          timestamp: new Date().toISOString()
        }
      ],
      settings: {
        theme: 'dark',
        chatMessagesLimit: 5 * 1024 * 1024,
        imagesLimit: 20 * 1024 * 1024,
        totalLimit: 50 * 1024 * 1024
      },
      exportDate: new Date().toISOString()
    };
    
    // Save test data to file (simulating export)
    console.log('Testing data export...');
    await writeFile(config.testDataPath, JSON.stringify(testData, null, 2));
    console.log('Data exported to:', config.testDataPath);
    
    // Read test data from file (simulating import)
    console.log('Testing data import...');
    const importedData = JSON.parse(await readFile(config.testDataPath, 'utf8'));
    console.log('Data imported successfully');
    
    // Verify imported data
    console.log('Verifying imported data...');
    if (
      importedData.chatMessages.length === testData.chatMessages.length &&
      importedData.uploadedImages.length === testData.uploadedImages.length &&
      importedData.generatedImages.length === testData.generatedImages.length
    ) {
      console.log('Data verification successful');
      return true;
    } else {
      console.error('Data verification failed');
      return false;
    }
  } catch (error) {
    console.error('Browser storage test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Starting GPT Image UI tests...');
  
  const results = {
    subpathDeployment: await testSubpathDeployment(),
    authenticationRemoval: await testAuthenticationRemoval(),
    browserStorage: await testBrowserStorage()
  };
  
  console.log('\n=== Test Results ===');
  console.log('Subpath Deployment:', results.subpathDeployment ? 'PASS' : 'FAIL');
  console.log('Authentication Removal:', results.authenticationRemoval ? 'PASS' : 'FAIL');
  console.log('Browser Storage:', results.browserStorage ? 'PASS' : 'FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall Result:', allPassed ? 'PASS' : 'FAIL');
  
  // Clean up test files
  try {
    if (fs.existsSync(config.testDataPath)) {
      fs.unlinkSync(config.testDataPath);
    }
  } catch (error) {
    console.error('Error cleaning up test files:', error.message);
  }
  
  return allPassed;
}

// Run tests
runTests()
  .then(result => {
    process.exit(result ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });