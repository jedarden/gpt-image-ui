const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create directory if it doesn't exist
const publicDir = path.join(__dirname, 'client', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to create a simple PNG file
function createSimplePNG(width, height, filename) {
  console.log(`Creating ${filename}...`);
  const filePath = path.join(publicDir, filename);
  
  // PNG file structure
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (image header)
  const IHDR = Buffer.alloc(13);
  IHDR.writeUInt32BE(width, 0);  // Width
  IHDR.writeUInt32BE(height, 4); // Height
  IHDR.writeUInt8(8, 8);         // Bit depth
  IHDR.writeUInt8(2, 9);         // Color type (2 = RGB)
  IHDR.writeUInt8(0, 10);        // Compression method
  IHDR.writeUInt8(0, 11);        // Filter method
  IHDR.writeUInt8(0, 12);        // Interlace method
  
  const IHDRChunk = createChunk('IHDR', IHDR);
  
  // Create a simple blue image data
  const dataSize = width * height * 3; // 3 bytes per pixel (RGB)
  const imageData = Buffer.alloc(dataSize);
  
  // Fill with blue color (#3498db)
  for (let i = 0; i < dataSize; i += 3) {
    imageData[i] = 52;     // R (0x34)
    imageData[i + 1] = 152; // G (0x98)
    imageData[i + 2] = 219; // B (0xdb)
  }
  
  // Compress the image data
  const compressedData = zlib.deflateSync(imageData);
  
  // IDAT chunk (image data)
  const IDATChunk = createChunk('IDAT', compressedData);
  
  // IEND chunk (end of image)
  const IENDChunk = createChunk('IEND', Buffer.alloc(0));
  
  // Combine all chunks
  const pngFile = Buffer.concat([signature, IHDRChunk, IDATChunk, IENDChunk]);
  
  // Write to file
  fs.writeFileSync(filePath, pngFile);
  console.log(`${filename} created successfully`);
}

// Helper function to create a PNG chunk
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  
  // Calculate CRC
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = calculateCRC(crcData);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC calculation for PNG chunks
function calculateCRC(data) {
  let crc = 0xffffffff;
  const crcTable = [];
  
  // Generate CRC table
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }
  
  // Calculate CRC
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  
  crc = crc ^ 0xffffffff;
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeInt32BE(crc, 0);
  return crcBuffer;
}

// Create a simple favicon.ico file
console.log('Creating favicon.ico...');
const faviconPath = path.join(publicDir, 'favicon.ico');
// Just create a minimal ICO file structure
const iconHeader = Buffer.from([
  0x00, 0x00,             // Reserved
  0x01, 0x00,             // ICO format
  0x01, 0x00,             // 1 image
  0x10, 0x10,             // 16x16 pixels
  0x00,                   // No color palette
  0x00,                   // Reserved
  0x01, 0x00,             // 1 color plane
  0x18, 0x00,             // 24 bits per pixel
  0x28, 0x00, 0x00, 0x00, // Size of BITMAPINFOHEADER
  0x10, 0x00, 0x00, 0x00, // Width
  0x20, 0x00, 0x00, 0x00, // Height (2x actual height for ICO format)
  0x00, 0x00              // Rest of the header (simplified)
]);

// Create a minimal ICO file
fs.writeFileSync(faviconPath, iconHeader);
console.log('favicon.ico created successfully');

// Create logo files
createSimplePNG(192, 192, 'logo192.png');
createSimplePNG(512, 512, 'logo512.png');

console.log('All logo files created successfully');