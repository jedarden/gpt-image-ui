/**
 * Browser test script for GPT Image UI
 * This script uses Puppeteer to test the frontend functionality
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  subPath: '/imagegen',
  screenshotDir: path.join(__dirname, 'screenshots'),
  testTimeout: 30000 // 30 seconds
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

/**
 * Take a screenshot
 * @param {Object} page - Puppeteer page object
 * @param {string} name - Screenshot name
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
}

/**
 * Test subpath deployment in browser
 * @param {Object} browser - Puppeteer browser object
 */
async function testSubpathDeployment(browser) {
  console.log('\n=== Testing Subpath Deployment in Browser ===');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the app with subpath
    console.log(`Navigating to ${config.baseUrl}${config.subPath}`);
    await page.goto(`${config.baseUrl}${config.subPath}`, { waitUntil: 'networkidle0', timeout: config.testTimeout });
    
    // Take a screenshot
    await takeScreenshot(page, 'subpath-deployment');
    
    // Check if the app loaded correctly
    const appElement = await page.$('.app');
    if (!appElement) {
      throw new Error('App did not load correctly with subpath');
    }
    
    // Check if static assets loaded correctly
    const cssLoaded = await page.evaluate(() => {
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(styles).every(style => !style.href.includes('undefined'));
    });
    
    if (!cssLoaded) {
      throw new Error('CSS assets did not load correctly with subpath');
    }
    
    console.log('Subpath deployment test in browser successful');
    return true;
  } catch (error) {
    console.error('Subpath deployment test in browser failed:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test authentication removal in browser
 * @param {Object} browser - Puppeteer browser object
 */
async function testAuthenticationRemoval(browser) {
  console.log('\n=== Testing Authentication Removal in Browser ===');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log(`Navigating to ${config.baseUrl}${config.subPath}`);
    await page.goto(`${config.baseUrl}${config.subPath}`, { waitUntil: 'networkidle0', timeout: config.testTimeout });
    
    // Take a screenshot
    await takeScreenshot(page, 'authentication-removal');
    
    // Check if login/register elements are not present
    const loginElements = await page.$$('.login-form, .register-form, .auth-form');
    if (loginElements.length > 0) {
      throw new Error('Authentication UI elements are still present');
    }
    
    // Check if chat interface is directly accessible
    const chatInterface = await page.$('.chat-interface');
    if (!chatInterface) {
      throw new Error('Chat interface is not directly accessible');
    }
    
    console.log('Authentication removal test in browser successful');
    return true;
  } catch (error) {
    console.error('Authentication removal test in browser failed:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Test browser storage functionality
 * @param {Object} browser - Puppeteer browser object
 */
async function testBrowserStorage(browser) {
  console.log('\n=== Testing Browser Storage in Browser ===');
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log(`Navigating to ${config.baseUrl}${config.subPath}`);
    await page.goto(`${config.baseUrl}${config.subPath}`, { waitUntil: 'networkidle0', timeout: config.testTimeout });
    
    // Take a screenshot
    await takeScreenshot(page, 'browser-storage-initial');
    
    // Test localStorage functionality
    const storageTest = await page.evaluate(() => {
      try {
        // Test setting localStorage
        localStorage.setItem('test_key', 'test_value');
        
        // Test getting localStorage
        const value = localStorage.getItem('test_key');
        
        // Test clearing localStorage
        localStorage.removeItem('test_key');
        
        return value === 'test_value';
      } catch (error) {
        return false;
      }
    });
    
    if (!storageTest) {
      throw new Error('Basic localStorage functionality test failed');
    }
    
    // Test storage manager UI
    const storageManager = await page.$('.storage-manager');
    if (!storageManager) {
      throw new Error('Storage manager UI not found');
    }
    
    // Click to expand storage details
    await page.click('.storage-summary');
    await page.waitForSelector('.storage-details', { visible: true, timeout: 5000 });
    
    // Take a screenshot of expanded storage manager
    await takeScreenshot(page, 'browser-storage-expanded');
    
    console.log('Browser storage test in browser successful');
    return true;
  } catch (error) {
    console.error('Browser storage test in browser failed:', error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Run all browser tests
 */
async function runBrowserTests() {
  console.log('Starting GPT Image UI browser tests...');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = {
      subpathDeployment: await testSubpathDeployment(browser),
      authenticationRemoval: await testAuthenticationRemoval(browser),
      browserStorage: await testBrowserStorage(browser)
    };
    
    console.log('\n=== Browser Test Results ===');
    console.log('Subpath Deployment:', results.subpathDeployment ? 'PASS' : 'FAIL');
    console.log('Authentication Removal:', results.authenticationRemoval ? 'PASS' : 'FAIL');
    console.log('Browser Storage:', results.browserStorage ? 'PASS' : 'FAIL');
    
    const allPassed = Object.values(results).every(result => result);
    console.log('\nOverall Browser Test Result:', allPassed ? 'PASS' : 'FAIL');
    
    return allPassed;
  } catch (error) {
    console.error('Browser test execution error:', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runBrowserTests()
    .then(result => {
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

module.exports = {
  runBrowserTests
};