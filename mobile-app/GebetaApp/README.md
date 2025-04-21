# Gebeta Food Delivery - Android App

This is a React Native/Expo implementation of the Gebeta Food Delivery application.

## Features

- Native Android app experience
- Authentication via phone number (OTP) or social login
- Restaurant listings with categories and filters
- Food item browsing
- Cart management
- Order tracking with maps
- User profile management
- Persistent login with AsyncStorage

## Requirements

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- EAS CLI (for building APKs)
- Google Maps API Key (for location features)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Use Expo Go app on your Android device to scan the QR code

## Building the APK

To build an Android APK file:

1. Make sure you have an Expo account:

```bash
npx eas login
```

2. Configure your project:

```bash
npx eas build:configure
```

3. Build the preview APK:

```bash
npx eas build -p android --profile preview
```

This will start the build process on Expo's servers. When complete, you'll get a download link for your APK file.

## Production Build

For a production-ready app bundle:

```bash
npx eas build -p android --profile production
```

## Customizing the App

- Edit `app.json` to change app name, version, and other configurations
- Replace icon and splash images in `src/assets/`
- Update Google Maps API Key in `app.json`

## License

© 2025 Gebeta Food Delivery. All rights reserved.