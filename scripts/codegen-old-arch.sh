#!/bin/bash


# cd fabricexaple/android
#./gradlew generateCodegenArtifactsFromSchema
# rm -rf ../../android/src/main/old-arch/
# cp -rf  ../../android/build/generated/source/codegen/java/ ../../android/src/main/old-arch/

set -e
SCRIPTDIR=`dirname -- "$0"`
echo "=> $SCRIPTDIR"
BASEDIR=$SCRIPTDIR/../fabricexample
ROOTDIR=..
RN=./node_modules/react-native
RNCODEGEN=./node_modules/@react-native/codegen
ANDROID=$ROOTDIR/android
GENERATED=$ANDROID/build/generated
OLD_ARCH=$ANDROID/src/main/old-arch
SPECS=$ROOTDIR/src/specs

pushd $BASEDIR
yarn install
rm -rf $GENERATED
rm -rf $OLD_ARCH
mkdir -p $GENERATED/source/codegen/
echo "=> combine-js-to-schema-cli.js"
node $RNCODEGEN/lib/cli/combine/combine-js-to-schema-cli.js --platform android $GENERATED/source/codegen/schema.json $SPECS
echo "=> generate-specs-cli.js"
node $RN/scripts/generate-specs-cli.js --platform android --schemaPath $GENERATED/source/codegen/schema.json --outputDir $GENERATED/source/codegen --libraryName rnmapbox_maps_specs --javaPackageName com.mapbox.rctmgl
cp -rf  $GENERATED/source/codegen/java/ $OLD_ARCH/
popd