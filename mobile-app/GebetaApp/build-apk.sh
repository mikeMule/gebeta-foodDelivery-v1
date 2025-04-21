#!/bin/bash

# Gebeta Food Delivery - Android APK Build Script
echo "=================================================="
echo "Gebeta Food Delivery - Android APK Build Process"
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
echo "Checking and installing dependencies..."
npm install

# Prepare assets
echo "Preparing assets..."
node prepareAssets.js

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Login to Expo (will prompt for credentials)
echo "Please log in to your Expo account..."
npx eas login

# Configure the project for building
echo "Configuring the project..."
npx eas build:configure

# Start the build process for Android
echo "Starting Android APK build (preview profile)..."
echo "This process will take some time. When complete, you'll get a download link."
npx eas build -p android --profile preview

echo "=================================================="
echo "Build process initiated!"
echo ""
echo "The build will be processed on Expo's build servers."
echo "When complete, you'll receive a download link for the APK."
echo ""
echo "NOTE: For a production-ready APK, you should replace"
echo "the placeholder assets with properly designed ones."
echo "=================================================="