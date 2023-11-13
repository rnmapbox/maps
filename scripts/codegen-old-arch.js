const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function exec(command) {
  console.log('=> ' + command);
  execSync(command);
}

const ROOT_DIR = path.resolve(__dirname, '..');
const EXAMPLE_DIR = path.resolve(ROOT_DIR, 'example');
const ANDROID_DIR = path.resolve(ROOT_DIR, 'android');
const GENERATED_DIR = path.resolve(ANDROID_DIR, 'build/generated');
const OLD_ARCH_DIR = path.resolve(ANDROID_DIR, 'src/main/old-arch');
const SPECS_DIR = path.resolve(ROOT_DIR, 'src/specs');

const RN_DIR = path.resolve(EXAMPLE_DIR, 'node_modules/react-native');
const RN_CODEGEN_DIR = path.resolve(
  EXAMPLE_DIR,
  'node_modules/@react-native/codegen',
);

function javaOldArchDir() {
  return OLD_ARCH_DIR;
}

async function generateCodegenJavaOldArch() {
  exec(`rm -rf ${GENERATED_DIR} ${OLD_ARCH_DIR}`);
  exec(`mkdir -p ${GENERATED_DIR}/source/codegen/`);

  exec(
    `node ${RN_CODEGEN_DIR}/lib/cli/combine/combine-js-to-schema-cli.js --platform android ${GENERATED_DIR}/source/codegen/schema.json ${SPECS_DIR}`,
  );
  exec(
    `node ${RN_DIR}/scripts/generate-specs-cli.js --platform android --schemaPath ${GENERATED_DIR}/source/codegen/schema.json --outputDir ${GENERATED_DIR}/source/codegen --libraryName rnmapbox_maps_specs --javaPackageName com.rnmapbox.rnmbx`,
  );

  exec(`cp -rf ${GENERATED_DIR}/source/codegen/java/ ${OLD_ARCH_DIR}/`);
}

if (require.main === module) {
  async function main() {
    await generateCodegenJavaOldArch();
  }
  main();
}

module.exports = { generateCodegenJavaOldArch, javaOldArchDir };

/*
#!/bin/bash


# cd fabricexaple/android
#./gradlew generateCodegenArtifactsFromSchema
# rm -rf ../../android/src/main/old-arch/
# cp -rf  ../../android/build/generated/source/codegen/java/ ../../android/src/main/old-arch/

set -e
SCRIPTDIR=`dirname -- "$0"`
echo "=> $SCRIPTDIR"
BASEDIR=$SCRIPTDIR/../example
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
node $RN/scripts/generate-specs-cli.js --platform android --schemaPath $GENERATED/source/codegen/schema.json --outputDir $GENERATED/source/codegen --libraryName rnmapbox_maps_specs --javaPackageName com.mapbox.rnmbx
cp -rf  $GENERATED/source/codegen/java/ $OLD_ARCH/
popd
*/
