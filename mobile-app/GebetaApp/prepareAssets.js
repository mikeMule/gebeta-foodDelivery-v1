/**
 * This script prepares all required assets for the Gebeta Food Delivery app
 * Run this before building the APK
 */

const fs = require('fs');
const path = require('path');

// Create placeholder font files
console.log('Creating placeholder font files...');

const fontFiles = [
  'DMSans-Regular.ttf',
  'DMSans-Medium.ttf',
  'DMSans-Bold.ttf'
];

// This is the minimum valid TTF file data (empty font)
const emptyTTF = Buffer.from([
  0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

const fontsDir = path.join(__dirname, 'assets/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

for (const fontFile of fontFiles) {
  const fontPath = path.join(fontsDir, fontFile);
  fs.writeFileSync(fontPath, emptyTTF);
  console.log(`Created placeholder font: ${fontFile}`);
}

// Function to create a minimal empty PNG file (1x1 pixel)
function createPlaceholderPNG(fileName) {
  // This is a minimal valid PNG file (1x1 transparent pixel)
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  const filePath = path.join(__dirname, 'assets', fileName);
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`Created placeholder image: ${fileName}`);
}

// Create required image assets
console.log('\nCreating placeholder image assets...');
const requiredImages = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png'
];

for (const imageName of requiredImages) {
  createPlaceholderPNG(imageName);
}

console.log('\nAll placeholder assets have been created successfully!');
console.log('\nIMPORTANT: Before producing a final APK, replace these placeholder assets with real, properly designed assets.');
console.log('You are now ready to run the build command:');
console.log('  npx eas build -p android --profile preview');