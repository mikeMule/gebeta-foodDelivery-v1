# Building the Gebeta Food Delivery APK

This document provides instructions for building an Android APK file for the Gebeta Food Delivery app.

## Prerequisites

Before proceeding, ensure you have the following:

1. **Node.js** (v14 or newer) installed
2. An **Expo account** (create one at https://expo.dev/signup if needed)
3. Internet connection

## Preparing the Build Environment

The app has been set up to use Expo's EAS Build service, which handles the complexities of Android app building in the cloud. This means you don't need to install Android Studio or the Android SDK locally.

## Building the APK

### Automated Method (Recommended)

We've provided a build script that automates the entire process:

1. Open a terminal/command prompt
2. Navigate to the project directory:
   ```bash
   cd mobile-app/GebetaApp
   ```
3. Run the build script:
   ```bash
   ./build-apk.sh
   ```
4. Follow the prompts to log in to your Expo account
5. Wait for the build to complete - you'll receive a download link for the APK

### Manual Method

If you prefer to run the commands manually:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install the EAS CLI if not already installed:
   ```bash
   npm install -g eas-cli
   ```

3. Create placeholder assets:
   ```bash
   node prepareAssets.js
   ```

4. Log in to your Expo account:
   ```bash
   npx eas login
   ```

5. Configure the build:
   ```bash
   npx eas build:configure
   ```

6. Start the build process:
   ```bash
   npx eas build -p android --profile preview
   ```

## Build Profiles

The app has three build profiles configured in `eas.json`:

- **development**: For development and testing (requires Expo Go app)
- **preview**: For generating installable APK files for testing
- **production**: For generating optimized app bundles for Play Store deployment

## Customizing the Build

Before distributing the app, you should:

1. Replace the placeholder assets with proper designs:
   - `assets/icon.png` (1024x1024 PNG)
   - `assets/splash.png` (1242x2436 PNG)
   - `assets/adaptive-icon.png` (1024x1024 PNG)
   - Font files in `assets/fonts/`

2. Configure the Google Maps API key in `app.config.js`

3. Update the app metadata in `app.config.js` (app name, version, etc.)

## Troubleshooting

- **Build Fails**: Check that all placeholder assets exist and are valid files
- **Login Issues**: Make sure you've verified your Expo account email
- **Google Maps Not Working**: Ensure you've set a valid Google Maps API key

## Final Notes

The APK generated through this process is intended for testing and personal use. For production distribution through the Google Play Store, additional steps like signing and optimization would be required.