/**
 * This script generates placeholder assets for the Gebeta Food Delivery app
 * Run with: node src/utils/generateAssets.js
 */

const fs = require('fs');
const path = require('path');

// Create SVG icon content
const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#FFF9F2"/>
  <circle cx="512" cy="512" r="300" fill="#8B572A"/>
  <circle cx="512" cy="512" r="230" fill="#E5A764"/>
  <circle cx="382" cy="382" r="65" fill="#C73030"/>
  <circle cx="642" cy="382" r="65" fill="#4CAF50"/>
  <circle cx="512" cy="642" r="65" fill="#8D6E63"/>
</svg>`;

// Create SVG splash screen content
const splashSvg = `<svg width="1242" height="2436" viewBox="0 0 1242 2436" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="2436" fill="#FFF9F2"/>
  <circle cx="621" cy="1000" r="200" fill="#8B572A"/>
  <circle cx="621" cy="1000" r="150" fill="#E5A764"/>
  <circle cx="536" cy="915" r="45" fill="#C73030"/>
  <circle cx="706" cy="915" r="45" fill="#4CAF50"/>
  <circle cx="621" cy="1085" r="45" fill="#8D6E63"/>
  <text x="621" y="1300" text-anchor="middle" font-size="100" font-family="Arial" font-weight="bold" fill="#4F2D1F">Gebeta</text>
  <text x="621" y="1400" text-anchor="middle" font-size="48" font-family="Arial" fill="#8B572A">Ethiopian Food Delivery</text>
</svg>`;

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../../assets');
if (!fs.existsSync(assetsDir)){
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Write icon.svg file
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);

// Write splash.svg file
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);

// Write adaptive-icon.svg file (same as icon)
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), iconSvg);

// Write favicon.svg file (same as icon)
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), iconSvg);

console.log('SVG assets generated successfully!');
console.log('You\'ll need to convert these to PNG format before building the app');
console.log('Consider using a tool like Inkscape, SVGOMG, or an online converter');