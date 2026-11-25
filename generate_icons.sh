#!/bin/bash
set -e

echo "Generating Android Icons..."
sips -z 48 48 src/assets/logo.png --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -z 72 72 src/assets/logo.png --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -z 96 96 src/assets/logo.png --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -z 144 144 src/assets/logo.png --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -z 192 192 src/assets/logo.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

sips -z 48 48 src/assets/logo.png --out android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
sips -z 72 72 src/assets/logo.png --out android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
sips -z 96 96 src/assets/logo.png --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
sips -z 144 144 src/assets/logo.png --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
sips -z 192 192 src/assets/logo.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "Generating iOS Icons..."
DIR="ios/Kindling/Images.xcassets/AppIcon.appiconset"
sips -z 40 40 src/assets/logo.png --out $DIR/icon-20@2x.png
sips -z 60 60 src/assets/logo.png --out $DIR/icon-20@3x.png
sips -z 58 58 src/assets/logo.png --out $DIR/icon-29@2x.png
sips -z 87 87 src/assets/logo.png --out $DIR/icon-29@3x.png
sips -z 80 80 src/assets/logo.png --out $DIR/icon-40@2x.png
sips -z 120 120 src/assets/logo.png --out $DIR/icon-40@3x.png
sips -z 120 120 src/assets/logo.png --out $DIR/icon-60@2x.png
sips -z 180 180 src/assets/logo.png --out $DIR/icon-60@3x.png
sips -z 1024 1024 src/assets/logo.png --out $DIR/icon-1024.png

echo "Done!"
