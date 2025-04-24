#!/bin/bash

# This script converts the SVG to PNG formats required for Android

# Check if android directory exists
if [ ! -d "android" ]; then
  echo "Android directory not found. Run the build-android.sh script first."
  exit 1
fi

# Create assets folder if it doesn't exist
mkdir -p android_icons

echo "Converting SVG to PNG for splash and app icons..."

# Create ic_splash.png
# (You would need inkscape or another tool for SVG to PNG conversion)
echo "For proper icon conversion, you need to download the generated SVG"
echo "and convert it to PNG using tools like Inkscape or online converters."
echo "Then place the converted images in the android/app/src/main/res/drawable folders."

# Create a simple placeholder splash icon using echo
# This is NOT a real image - just for demonstration
echo "Creating placeholder splash screen (replace with real image)"
cat > android/app/src/main/res/drawable/ic_splash.xml << EOL
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="512"
    android:viewportHeight="512">
  <path
      android:fillColor="#FFF9F1"
      android:pathData="M0,0h512v512h-512z"/>
  <path
      android:fillColor="#E5A764"
      android:pathData="M256,256m-180,0a180,180 0,1 1,360 0a180,180 0,1 1,-360 0"/>
  <path
      android:fillColor="#F9F5F0"
      android:strokeWidth="1"
      android:pathData="M256,230m-150,0a150,150 0,1 1,300 0a150,150 0,1 1,-300 0"
      android:strokeColor="#8B572A"/>
  <path
      android:fillColor="#00000000"
      android:pathData="M256,420L256,420"
      android:strokeWidth="40"
      android:strokeColor="#4F2D1F"
      android:strokeLineCap="round"/>
</vector>
EOL

echo "Icon conversion process completed."
echo "For a production app, you would need to replace these with properly converted PNG files."