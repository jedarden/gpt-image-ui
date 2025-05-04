/**
 * Main test runner for GPT Image UI
 * This script runs all tests for subpath deployment, authentication removal, and browser storage
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  serverPort: 3001,
  clientPort: 3000,
  serverStartTimeout: 10000, // 10 seconds
  clientStartTimeout: 10000, // 10 seconds
  testTimeout: 60000 // 60 seconds
};

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Start the backend server
 * @returns {Object} Child process
 */
function startServer() {
  console.log('Starting backend server...');
  
  // Copy .env.test to .env for the server
  fs.copyFileSync(path.join(__dirname, '.env.test'), path.join(__dirname, '.env'));
  
  const serverProcess = spawn('node', ['src/index.js'], {
    env: { ...process.env, PORT: config.serverPort },
    stdio: 'pipe'
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`[SERVER]: ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR]: ${data.toString().trim()}`);
  });
  
  return serverProcess;
}

/**
 * Start the frontend client
 * @returns {Object} Child process
 */
function startClient() {
  console.log('Starting frontend client...');
  
  // Copy .env.test to .env for the client
  fs.copyFileSync(path.join(__dirname, 'client/.env.test'), path.join(__dirname, 'client/.env'));
  
  const clientProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    env: { ...process.env, PORT: config.clientPort, BROWSER: 'none' },
    stdio: 'pipe'
  });
  
  clientProcess.stdout.on('data', (data) => {
    console.log(`[CLIENT]: ${data.toString().trim()}`);
  });
  
  clientProcess.stderr.on('data', (data) => {
    console.error(`[CLIENT ERROR]: ${data.toString().trim()}`);
  });
  
  return clientProcess;
}

/**
 * Run the API tests
 * @returns {Promise<boolean>} Test result
 */
function runApiTests() {
  return new Promise((resolve, reject) => {
    console.log('Running API tests...');
    
    const testProcess = spawn('node', ['test-subpath-auth-storage.js'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('API tests completed successfully');
        resolve(true);
      } else {
        console.error(`API tests failed with code ${code}`);
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('Error running API tests:', error);
      reject(error);
    });
  });
}

/**
 * Run the browser tests
 * @returns {Promise<boolean>} Test result
 */
function runBrowserTests() {
  return new Promise((resolve, reject) => {
    console.log('Running browser tests...');
    
    const testProcess = spawn('node', ['browser-test.js'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Browser tests completed successfully');
        resolve(true);
      } else {
        console.error(`Browser tests failed with code ${code}`);
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('Error running browser tests:', error);
      reject(error);
    });
  });
}

/**
 * Wait for a specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting GPT Image UI tests...');
  
  let serverProcess = null;
  let clientProcess = null;
  
  try {
    // Start the server
    serverProcess = startServer();
    
    // Wait for server to start
    console.log(`Waiting ${config.serverStartTimeout / 1000} seconds for server to start...`);
    await wait(config.serverStartTimeout);
    
    // Start the client
    clientProcess = startClient();
    
    // Wait for client to start
    console.log(`Waiting ${config.clientStartTimeout / 1000} seconds for client to start...`);
    await wait(config.clientStartTimeout);
    
    // Run API tests
    const apiTestResult = await runApiTests();
    
    // Run browser tests
    const browserTestResult = await runBrowserTests();
    
    // Print overall results
    console.log('\n=== Overall Test Results ===');
    console.log('API Tests:', apiTestResult ? 'PASS' : 'FAIL');
    console.log('Browser Tests:', browserTestResult ? 'PASS' : 'FAIL');
    
    const allPassed = apiTestResult && browserTestResult;
    console.log('\nFinal Result:', allPassed ? 'PASS' : 'FAIL');
    
    return allPassed;
  } catch (error) {
    console.error('Error running tests:', error);
    return false;
  } finally {
    // Clean up processes
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
    }
    
    if (clientProcess) {
      console.log('Stopping client...');
      clientProcess.kill();
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(result => {
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests
};