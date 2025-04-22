#!/bin/bash

# Gebeta Food Delivery - Simple Build Script
echo "=================================================="
echo "Gebeta Food Delivery - Simple Build Process"
echo "=================================================="

# Install dependencies if needed
echo "Preparing assets..."
node prepareAssets.js

# Create a directory for the export
mkdir -p dist/android

# Create a simple Android file structure
mkdir -p dist/android/app/src/main/assets
mkdir -p dist/android/app/src/main/res/drawable-mdpi
mkdir -p dist/android/app/src/main/res/drawable-hdpi
mkdir -p dist/android/app/src/main/res/drawable-xhdpi
mkdir -p dist/android/app/src/main/res/drawable-xxhdpi
mkdir -p dist/android/app/src/main/res/drawable-xxxhdpi

# Copy assets to the export directory
cp -r assets/* dist/android/app/src/main/assets/
cp assets/icon.png dist/android/app/src/main/res/drawable-mdpi/
cp assets/icon.png dist/android/app/src/main/res/drawable-hdpi/
cp assets/icon.png dist/android/app/src/main/res/drawable-xhdpi/
cp assets/icon.png dist/android/app/src/main/res/drawable-xxhdpi/
cp assets/icon.png dist/android/app/src/main/res/drawable-xxxhdpi/

# Create a simple manifest file
cat > dist/android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.gebeta.fooddelivery">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/icon"
        android:label="Gebeta Food Delivery"
        android:roundIcon="@drawable/icon"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_GOOGLE_MAPS_API_KEY" />
            
        <activity
            android:name=".MainActivity"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Create project files
cat > dist/android/app/build.gradle << 'EOF'
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"

android {
    compileSdkVersion 34
    namespace "com.gebeta.fooddelivery"
    
    defaultConfig {
        applicationId "com.gebeta.fooddelivery"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation "com.facebook.react:react-android"
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "com.google.android.material:material:1.10.0"
}
EOF

# Create a README file
cat > dist/android/README.md << 'EOF'
# Gebeta Food Delivery Android Build

This directory contains the exported files for building the Gebeta Food Delivery Android app.

## Building the APK

To build the APK:

1. Open this project in Android Studio
2. Configure your Google Maps API key in AndroidManifest.xml
3. Click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
4. The APK will be generated in the app/build/outputs/apk directory

## App Features

- Ethiopian cuisine food delivery
- Restaurant browsing and ordering
- Order tracking with maps
- TeleBirr payment integration
- Profile management
- Order history
EOF

echo "=================================================="
echo "Simple build process completed!"
echo ""
echo "The project files have been exported to the dist/android directory."
echo ""
echo "To build a real APK, you would need to:"
echo "1. Download these files"
echo "2. Set up a proper React Native Android project"
echo "3. Import these files into that project"
echo "4. Build using Android Studio"
echo ""
echo "For a more functional build, consider using:"
echo "1. Expo's web builds: https://docs.expo.dev/build-reference/apk/"
echo "2. React Native CLI directly: https://reactnative.dev/docs/signed-apk-android"
echo "=================================================="