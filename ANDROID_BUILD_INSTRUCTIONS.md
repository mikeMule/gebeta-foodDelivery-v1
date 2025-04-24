# Gebeta Food Delivery - APK Build Instructions

This document explains how to build and install the Gebeta Food Delivery Android APK.

## Prerequisites

- Android Studio installed on your computer
- Node.js and npm installed on your computer
- Java Development Kit (JDK) 11 or newer
- Android SDK with build tools installed

## Building the APK

### 1. Clone the repository and install dependencies

```bash
git clone [repository-url]
cd gebeta-food-delivery
npm install
```

### 2. Run the build-android.sh script

```bash
./build-android.sh
```

This script:
- Builds the web application
- Initializes Capacitor and adds the Android platform
- Syncs the web build with the Android project
- Creates a splash screen configuration
- Opens Android Studio with the project

### 3. In Android Studio:

1. Wait for the Gradle sync to complete
2. Navigate to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Android Studio will build the APK and show a notification when the build is complete
4. Click on "locate" in the notification to find the APK file

The APK will be located in:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Installing the APK on a Device

### Method 1: Direct Transfer

1. Connect your Android device to your computer via USB
2. Enable USB debugging on your device (Settings > Developer options > USB debugging)
3. Copy the APK file to your device
4. On your device, use a file manager to locate and tap the APK to install it

### Method 2: Using ADB

1. Connect your Android device via USB and ensure USB debugging is enabled
2. Open a terminal/command prompt and navigate to the project directory
3. Run the following command:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: Distribution via Email or Cloud Storage

1. Email the APK to yourself or upload it to cloud storage (Google Drive, Dropbox, etc.)
2. Download the APK on your Android device
3. Tap the download to install (you may need to allow installation from unknown sources)

## Troubleshooting

### "App not installed" error
- Make sure you've enabled installation from unknown sources in your security settings
- If upgrading, try uninstalling the previous version first

### White screen or app crashes
- Check the Android Studio logs for errors
- Ensure your device is connected to the internet for API access

### Building issues in Android Studio
- Ensure you have the latest version of Android Studio
- Try File > Invalidate Caches and Restart

## Production Release (Future Steps)

For a production release, you would need to:

1. Create a signed release build using a proper keystore
2. Optimize app bundle size using Android App Bundles
3. Configure ProGuard for code shrinking and obfuscation
4. Test extensively on multiple device profiles
5. Publish to Google Play Store

## Icon Customization

The app currently uses placeholder icons. To use custom icons:

1. Replace the contents of `gebeta-icon.svg` with your custom SVG
2. Run `./convert-icons.sh` to generate PNGs
3. For production quality, you should use professional tools to convert the SVG to various resolution PNGs
4. Place the generated icons in the appropriate Android resource directories

## Note on Backend Connection

When testing on a physical device, ensure the backend URL in the app points to a publicly accessible server, not localhost.