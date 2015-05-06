#!/bin/sh

VERSION=$1

echo "Downloading Mapbox GL iOS $VERSION, this may take a minute."

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [ ! -d temp ]; then
    mkdir temp
fi

if [ -d ./RCTMapboxGL/MapboxGL.bundle ]; then
    rm -r RCTMapboxGL/MapboxGL.bundle
fi

mkdir RCTMapboxGL/MapboxGL.bundle

curl -sS http://mapbox.s3.amazonaws.com/mapbox-gl-native/ios/builds/mapbox-gl-ios-$VERSION.zip > temp.zip
unzip -o temp.zip -d temp
mv temp/libMapboxGL.a ./RCTMapboxGL
mv temp/Headers/* ./RCTMapboxGL
mv temp/MapboxGL.bundle/* ./RCTMapboxGL/MapboxGL.bundle
rm -r temp
rm temp.zip
