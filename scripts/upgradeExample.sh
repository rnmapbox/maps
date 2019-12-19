#!/bin/bash

react-native init RNMapboxGLExample
mv example/src RNMapboxGLExample/src
mv example/scripts RNMapboxGLExample/scripts
rm -rf example
mv RNMapboxGLExample example

# Edit package.json

cd example
npx json -I -f package.json -e 'this.scripts["copy:changes"]="node ./scripts/watch_rngl.js"'
npx json -I -f package.json -e 'this.scripts["pack:gl"]="./scripts/npm_pack_rngl.sh"'
npx json -I -f package.json -e 'this.scripts["clean:node:modules"]="./scripts/clean_node_modules.sh"'
npx json -I -f package.json -e 'this.scripts.preinstall="npm run pack:gl"'
npx json -I -f package.json -e 'this.scripts.postinstall="node ./scripts/set_access_token.js"'
npx json -I -f package.json -e 'this.scripts["reset:from:gl"]="npm run clean:node:modules && npm install"'
npx json -I -f package.json -e 'this.dependencies["@react-native-mapbox-gl/maps"]="file:../react-native-mapbox-gl-maps.tgz"'

# Install depencies
touch accesstoken
yarn add @mapbox/geo-viewport@0.4.0 @turf/along@5.1.5 @turf/bearing@5.1.5 @turf/distance@5.1.5 @turf/helpers@4.7.3 @turf/line-distance@4.7.3 @turf/nearest@4.7.3 buffer@5.1.0 install@0.12.2 @mapbox/mapbox-sdk@0.6.0 moment@2.24.0 npm@5.10.0 prop-types@15.7.2 react-native-elements@1.1.0 react-native-vector-icons react-native-safe-area-view@0.13.1 react-navigation@2.18.3 url@0.11.0
react-native link
rm accesstoken
cd ios && pod install && cd ../
