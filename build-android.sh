#!/bin/bash

# Script pentru construirea aplicației Android
# Nine Men's Morris Game

echo "=================================="
echo "Building Nine Men's Morris for Android"
echo "=================================="

# Verifică dacă suntem în directorul corect
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# 1. Build aplicația web
echo ""
echo "Step 1/3: Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Error: Web build failed!"
    exit 1
fi

# 2. Sync cu Capacitor
echo ""
echo "Step 2/3: Syncing with Capacitor..."
npx cap sync

if [ $? -ne 0 ]; then
    echo "Error: Capacitor sync failed!"
    exit 1
fi

# 3. Build APK Android
echo ""
echo "Step 3/3: Building Android APK..."
cd android && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "Error: Android build failed!"
    exit 1
fi

# Success!
echo ""
echo "=================================="
echo "✓ Build completed successfully!"
echo "=================================="
echo ""
echo "APK location:"
echo "$(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "To install on device:"
echo "adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
