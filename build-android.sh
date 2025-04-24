#!/bin/bash

# Build the web application
echo "Building web application..."
npm run build

# Initialize Capacitor if not already done
if [ ! -d "android" ]; then
  echo "Initializing Capacitor..."
  npx cap init "Gebeta Food Delivery" com.gebeta.fooddelivery --web-dir=dist
  
  echo "Adding Android platform..."
  npx cap add android
else
  echo "Android platform already exists, syncing changes..."
fi

# Sync the web build with Android
echo "Syncing web content with Android..."
npx cap sync android

# Open Android Studio (optional)
echo "Opening Android Studio..."
npx cap open android

echo "Build process completed! Android Studio should open with your project."
echo "In Android Studio, click 'Build > Build Bundle(s)/APK(s) > Build APK(s)' to generate your APK file."