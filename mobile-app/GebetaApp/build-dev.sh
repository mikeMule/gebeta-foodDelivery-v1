#!/bin/bash

# Gebeta Food Delivery - Development Build Script
echo "=================================================="
echo "Gebeta Food Delivery - Development Setup"
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

echo "=================================================="
echo "Development environment is ready!"
echo ""
echo "To run the app locally:"
echo "1. Install Expo Go on your Android or iOS device"
echo "2. Run: npm start"
echo "3. Scan the QR code with your device"
echo ""
echo "To export the project for manual building:"
echo "1. Run: npx expo export"
echo "2. The export will be created in the 'dist' directory"
echo "=================================================="

# Ask if user wants to start the development server
read -p "Would you like to start the development server now? (y/n) " answer
if [[ $answer == "y" || $answer == "Y" ]]; then
    echo "Starting development server..."
    npm start
fi