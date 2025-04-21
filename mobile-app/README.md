# Gebeta Food Delivery Mobile App

This directory contains the native Android mobile application for Gebeta Food Delivery, built with React Native and Expo.

## Features

- Authentication via phone number (OTP) or social login
- Restaurant discovery with categories and food items
- Cart and checkout flow with multiple delivery options
- Order tracking with real-time maps
- Order history and user profile management
- Ethiopian-themed UI with attention to accessibility

## Project Structure

```
mobile-app/GebetaApp/
├── assets/              # App images, fonts and other static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── navigation/      # Navigation configurations
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions and helpers
├── app.json             # Expo configuration
├── App.tsx              # Main app component
└── package.json         # Project dependencies
```

## Screens

The app includes the following screens:

1. **SplashScreen**: Initial loading screen with animation
2. **LoginScreen**: Phone number login with social alternatives
3. **OtpVerificationScreen**: Verification code entry
4. **HomeScreen**: Restaurant listings and featured items
5. **RestaurantDetailScreen**: Menu and restaurant information
6. **CartScreen**: Order review with delivery options
7. **OrderSuccessScreen**: Confirmation with animation
8. **OrderTrackingScreen**: Live order tracking with map
9. **ProfileScreen**: User account management
10. **MyOrdersScreen**: Order history with status tracking

## Building the App

To build and run the application:

1. Install dependencies:
   ```
   cd mobile-app/GebetaApp
   npm install
   ```

2. Start development server:
   ```
   npm start
   ```

3. Run on Android:
   ```
   npm run android
   ```

4. Build APK:
   ```
   npm run build:android
   ```

## Configuration

For Google Maps integration, obtain an API key and add it to:
- `app.json` in the `android.config.googleMaps.apiKey` property

For the TeleBirr payment integration, add your merchant credentials to the app configuration.

## Design System

The app follows a consistent design system with:
- Primary color: #8B572A (Ethiopian coffee brown)
- Secondary color: #E5A764 (Earthy amber)
- Text color: #4F2D1F (Dark brown)
- Accent color: #C73030 (Spicy red)
- Font families: DM Sans (Regular, Medium, Bold)

## Dependencies

- React Native
- Expo
- React Navigation
- React Native Paper (UI components)
- React Native Maps
- Async Storage
- Expo Location