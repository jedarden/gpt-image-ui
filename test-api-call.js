/**
 * Test script to make an API call to the server
 */

const axios = require('axios');

// Make a request to the chat API
async function testApiCall() {
  try {
    const response = await axios.post('http://localhost:3001/api/chat/message', {
      message: 'Generate an image of a mountain landscape',
      images: []
    });
    
    console.log('API call successful:', response.data);
  } catch (error) {
    console.error('API call failed:', error.response ? error.response.data : error.message);
  }
}

// Run the test
testApiCall();