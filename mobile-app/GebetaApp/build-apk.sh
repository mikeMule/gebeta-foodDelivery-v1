#!/bin/bash

# Build APK script for Gebeta Food Delivery

echo "========================================="
echo "Gebeta Food Delivery - APK Build Process"
echo "========================================="

# Check for required tools
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Check for Expo CLI
if ! command -v expo &> /dev/null; then
    echo "Installing Expo CLI..."
    npm install -g expo-cli
fi

# Check for EAS CLI
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

# Verify Expo Login
echo "Please login to your Expo account:"
npx eas login

# Configure the project
echo "Configuring project for build..."
npx eas build:configure

# Start the build process
echo "Starting Android APK build process..."
echo "This may take 15-30 minutes to complete."
npx eas build -p android --profile preview

echo "========================================="
echo "Build process initiated!"
echo "When complete, you will receive a download link for your APK file."
echo "Tip: Always test the APK on different devices before distribution."
echo "========================================="