/**
 * This script creates minimal placeholder PNG files for the app build
 * It's a workaround for testing, but you should replace these with properly designed assets
 */

const fs = require('fs');
const path = require('path');

// Function to create a minimal empty PNG file (1x1 pixel)
function createEmptyPNG(filePath) {
  // This is a minimal valid PNG file (1x1 transparent pixel)
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write the minimal PNG file
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`Created placeholder PNG: ${filePath}`);
}

// Assets directory
const assetsDir = path.join(__dirname, '../../assets');

// List of required PNG files
const requiredPNGs = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png'
];

// Create placeholder PNGs
for (const pngFile of requiredPNGs) {
  createEmptyPNG(path.join(assetsDir, pngFile));
}

console.log('Placeholder PNG files created successfully!');
console.log('Note: Replace these with actual designed assets before production.');