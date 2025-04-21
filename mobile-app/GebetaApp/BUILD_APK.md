# Building the Gebeta Food Delivery APK

This document provides instructions for building an Android APK file for the Gebeta Food Delivery app.

## Prerequisites

Before proceeding, ensure you have the following:

1. **Node.js** (v14 or newer) installed
2. An **Expo account** (create one at https://expo.dev/signup if needed)
3. Internet connection

## Build Options

We provide multiple ways to build the application depending on your needs:

### Option 1: Development Setup (Fastest)

This option sets up the app for development and testing with Expo Go:

```bash
cd mobile-app/GebetaApp
./build-dev.sh
```

This will:
- Install dependencies
- Create placeholder assets
- Set up the development environment
- Optionally start the Expo development server

You can then use the Expo Go app on your phone to scan the QR code and run the app directly.

### Option 2: Local Export (Intermediate)

This option exports the project for local building:

```bash
cd mobile-app/GebetaApp
./build-local.sh
```

This will:
- Install dependencies
- Create placeholder assets
- Export the project to the 'dist' directory
- Provide instructions for building an APK manually

### Option 3: Cloud Build Service (Complete APK)

This option uses Expo's EAS Build service to create a complete APK in the cloud:

```bash
cd mobile-app/GebetaApp
./build-apk.sh
```

This will:
- Install dependencies
- Create placeholder assets
- Log you into your Expo account
- Initialize and configure the EAS project
- Start the build process
- Provide a download link for the completed APK

## Troubleshooting

### EAS Build Issues

If you encounter errors with the EAS build service:

1. Check that your Expo account is verified
2. Ensure the project ID in app.config.js is valid for your account
3. Try running `npx eas init` manually to set up the project
4. If error "Invalid UUID appId" appears, your account may not be properly set up with this project

### Asset Issues

If the build fails due to asset problems:

1. Run `node prepareAssets.js` to regenerate placeholder assets
2. Check that all placeholders were created successfully
3. Ensure the app.config.js file has the correct paths to assets

### Network Issues

If you encounter network problems:

1. Check your internet connection
2. Ensure you can reach expo.dev and related services
3. Try using a different network if possible

## Customizing the App

Before distribution, customize the app by:

1. Replacing placeholder assets with proper designs
   - `assets/icon.png` (1024x1024 PNG)
   - `assets/splash.png` (1242x2436 PNG)
   - `assets/adaptive-icon.png` (1024x1024 PNG)
   - Font files in `assets/fonts/`

2. Setting up API keys in app.config.js for services like Google Maps

3. Updating app metadata including version, package name, etc.