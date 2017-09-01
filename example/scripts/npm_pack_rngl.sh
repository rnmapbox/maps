#!/bin/bash

echo "Moving into ${RNGL}"
cd ../

echo "Attempting to pack react-native-mapbox-gl"
npm pack
