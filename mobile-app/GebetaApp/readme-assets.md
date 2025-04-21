# Mobile App Structure

## Navigation Flow

```
SplashScreen
    │
    ▼
LoginScreen ◄───────────────┐
    │                       │
    ▼                       │
OtpVerificationScreen       │
    │                       │
    ▼                       │
MainTabNavigator            │
    │                       │
    ├─────┬─────┬─────┐     │
    ▼     ▼     ▼     ▼     │
HomeScreen CartScreen MyOrdersScreen ProfileScreen
    │         │                           │
    ▼         ▼                           │
RestaurantDetail                          │
    │         │                           │
    └────►    ▼                           │
          OrderSuccess                    │
               │                          │
               ▼                          │
          OrderTracking                   │
                                          │
                                          │
                             [Logout] ────┘
```

## App Screenshots (To be added after build)

Once the APK is built, screenshots will be added for:

1. Splash Screen
2. Login Screen
3. OTP Verification
4. Home Screen with restaurant listings
5. Restaurant Detail with menu items
6. Cart with delivery options
7. Order tracking map
8. User profile settings

## Color Scheme

The app uses the following color palette:

- Primary (Brown): `#8B572A`
- Secondary (Amber): `#E5A764`
- Text (Dark Brown): `#4F2D1F`
- Background (Cream): `#FFF9F2`
- Accent (Red): `#C73030`
- Success (Green): `#4CAF50`

## Font Family

- Primary Font: DM Sans (Regular, Medium, Bold)

## Icon Set

- Ionicons from Expo Vector Icons

## Build Process

To build the APK:

1. Run the build script:
   ```
   ./build-apk.sh
   ```

2. Login to your Expo account when prompted

3. Follow the on-screen instructions

4. Retrieve the APK URL when the build completes