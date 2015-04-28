#!/bin/sh

VERSION=$1

if ! which curl > /dev/null; then echo "curl command not found. Please install curl"; exit 1; fi;
if ! which unzip > /dev/null; then echo "unzip command not found. Please install unzip"; exit 1; fi;

if [ ! -f temp ]; then
    mkdir temp
fi

curl -sS http://mapbox.s3.amazonaws.com/mapbox-gl-native/ios/builds/mapbox-gl-ios-$VERSION.zip > temp.zip
unzip -o temp.zip -d temp
mv temp/libMapboxGL.a .
mv temp/Headers/* .
mv temp/MapboxGL.bundle .
rm -r temp
rm temp.zip
