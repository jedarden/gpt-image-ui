/**
 * End-to-End Test Setup
 * 
 * This file sets up the environment for end-to-end tests, including:
 * - Starting the server
 * - Setting up test database
 * - Configuring test browser
 * - Cleaning up resources after tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const axios = require('axios');
const puppeteer = require('puppeteer');

// Promisify fs functions
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);

// Global variables
let server;
let browser;
let apiBaseUrl;
let frontendUrl;

/**
 * Start the server and frontend for testing
 */
async function startServer() {
  // Create test environment file
  await createTestEnvFile();
  
  // Start backend server
  server = spawn('node', ['src/index.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3001',
      OPENAI_API_KEY: 'test-api-key'
    },
    cwd: path.resolve(__dirname, '../../')
  });
  
  // Log server output for debugging
  server.stdout.on('data', (data) => {
    console.log(`Server: ${data}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });
  
  // Set API base URL
  apiBaseUrl = 'http://localhost:3001';
  
  // Set frontend URL
  frontendUrl = 'http://localhost:3000';
  
  // Wait for server to start
  await waitForServer();
}

/**
 * Create test environment file
 */
async function createTestEnvFile() {
  const envContent = `
NODE_ENV=test
PORT=3001
OPENAI_API_KEY=test-api-key
JWT_SECRET=test-jwt-secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
  `.trim();
  
  // Create .env.test file
  await writeFile(path.resolve(__dirname, '../../.env.test'), envContent);
}

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  let retries = 0;
  const maxRetries = 30;
  
  while (retries < maxRetries) {
    try {
      await axios.get(`${apiBaseUrl}/api/health`);
      console.log('Server is ready');
      return;
    } catch (error) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Server failed to start');
}

/**
 * Start Puppeteer browser
 */
async function startBrowser() {
  browser = await puppeteer.launch({
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('Browser is ready');
}

/**
 * Create a new browser page
 */
async function createPage() {
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({
    width: 1280,
    height: 800
  });
  
  // Set default navigation timeout
  page.setDefaultNavigationTimeout(30000);
  
  // Enable console logging from the page
  page.on('console', (msg) => {
    console.log(`Browser console: ${msg.text()}`);
  });
  
  return page;
}

/**
 * Stop the server and browser
 */
async function stopAll() {
  // Close browser
  if (browser) {
    await browser.close();
    console.log('Browser closed');
  }
  
  // Stop server
  if (server) {
    server.kill();
    console.log('Server stopped');
  }
}

/**
 * Setup function to be called before all tests
 */
async function setup() {
  // Create test directories if they don't exist
  const testUploadsDir = path.resolve(__dirname, '../../uploads/test');
  await mkdir(testUploadsDir, { recursive: true });
  
  // Start server and browser
  await startServer();
  await startBrowser();
}

/**
 * Teardown function to be called after all tests
 */
async function teardown() {
  await stopAll();
  
  // Clean up test directories
  const testUploadsDir = path.resolve(__dirname, '../../uploads/test');
  await rmdir(testUploadsDir, { recursive: true });
}

// Export functions and variables for use in tests
module.exports = {
  setup,
  teardown,
  createPage,
  apiBaseUrl,
  frontendUrl
};