#!/bin/bash

echo "Moving into ${RNGL}"
cd ../

echo "Attempting to pack react-native-mapbox-gl"

name=$(npm pack)

echo "Renaming $name"

mv "$name" "react-native-mapbox-gl-maps.tgz" 