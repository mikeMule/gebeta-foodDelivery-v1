#!/bin/bash

# Gebeta Food Delivery - Local APK Build Script
echo "=================================================="
echo "Gebeta Food Delivery - Local APK Build Process"
echo "=================================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not installed."
    exit 1
fi

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Prepare assets
echo "Preparing assets..."
node prepareAssets.js

# Create dist directory if it doesn't exist
mkdir -p dist

# Use expo export to create a build that can be used locally
echo "Exporting project for local building..."
npx expo export --platform android

echo "=================================================="
echo "Export complete!"
echo ""
echo "The exported project files are now available in the 'dist' directory."
echo ""
echo "To build an APK manually:"
echo "1. Download the exported files"
echo "2. Use Android Studio to build the APK"
echo "   or follow the Expo documentation for manual builds:"
echo "   https://docs.expo.dev/build-reference/local-builds/"
echo ""
echo "NOTE: For a production-ready APK, you should replace"
echo "the placeholder assets with properly designed ones."
echo "=================================================="