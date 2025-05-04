const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create directory if it doesn't exist
const publicDir = path.join(__dirname, 'client', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple favicon.ico file (1x1 pixel)
console.log('Creating favicon.ico...');
const faviconPath = path.join(publicDir, 'favicon.ico');
const faviconCmd = `convert -size 64x64 xc:#3498db "${faviconPath}"`;
try {
  execSync(faviconCmd);
  console.log('favicon.ico created successfully');
} catch (error) {
  console.error('Error creating favicon.ico:', error.message);
  // Create an empty file as fallback
  fs.writeFileSync(faviconPath, Buffer.alloc(0));
  console.log('Created empty favicon.ico as fallback');
}

// Create simple PNG files
function createEmptyPNG(size, filename) {
  console.log(`Creating ${filename}...`);
  const filePath = path.join(publicDir, filename);
  
  // Create a simple colored square PNG
  const pngCmd = `convert -size ${size}x${size} xc:#3498db "${filePath}"`;
  try {
    execSync(pngCmd);
    console.log(`${filename} created successfully`);
  } catch (error) {
    console.error(`Error creating ${filename}:`, error.message);
    // Create an empty file as fallback
    fs.writeFileSync(filePath, Buffer.alloc(0));
    console.log(`Created empty ${filename} as fallback`);
  }
}

// Create logo files
createEmptyPNG(192, 'logo192.png');
createEmptyPNG(512, 'logo512.png');

console.log('Logo files created successfully');