#!/bin/bash

# Build the web application
echo "Building web application..."
npm run build

# Initialize Capacitor if not already done
if [ ! -d "android" ]; then
  echo "Initializing Capacitor..."
  npx cap init "Gebeta Food Delivery" com.gebeta.fooddelivery --web-dir=dist/public
  
  echo "Adding Android platform..."
  npx cap add android
else
  echo "Android platform already exists, syncing changes..."
fi

# Sync the web build with Android
echo "Syncing web content with Android..."
npx cap sync android

# Create a splash screen and icon folder if it doesn't exist
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/values

# Create a basic splash screen in the Android app
cat > android/app/src/main/res/values/colors.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#8B572A</color>
    <color name="colorPrimaryDark">#4F2D1F</color>
    <color name="colorAccent">#E5A764</color>
    <color name="gebeta_background">#FFF9F1</color>
</resources>
EOL

# Create a basic splash screen style
cat > android/app/src/main/res/values/styles.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
    </style>
</resources>
EOL

# Create a drawable for the splash screen
cat > android/app/src/main/res/drawable/splash.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/gebeta_background" />
    <item
        android:width="200dp"
        android:height="200dp"
        android:drawable="@drawable/ic_splash"
        android:gravity="center" />
</layer-list>
EOL

echo "Opening Android Studio..."
npx cap open android

echo "Build process completed! Android Studio should open with your project."
echo "In Android Studio, click 'Build > Build Bundle(s)/APK(s) > Build APK(s)' to generate your APK file."