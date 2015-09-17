#!/bin/sh

VERSION=$1

echo "Downloading Mapbox GL iOS $VERSION, this may take a minute."

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [ ! -d temp ]; then
    mkdir temp
fi

if [ -d ./RCTMapboxGL/Mapbox.bundle ]; then
    rm -r RCTMapboxGL/Mapbox.bundle
fi

mkdir RCTMapboxGL/Mapbox.bundle

curl -sS https://mapbox.s3.amazonaws.com/mapbox-gl-native/ios/builds/mapbox-ios-sdk-$VERSION.zip > temp.zip
unzip -o temp.zip -d temp
mv temp/libMapbox.a ./RCTMapboxGL
mv temp/Headers/* ./RCTMapboxGL
mv temp/Mapbox.bundle/* ./RCTMapboxGL/Mapbox.bundle
rm -r temp
rm temp.zip
