const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require('fs-extra');

const RNGL_DIR = path.join('..');
const RNGL_EXAMPLE_DIR = path.join(
  'node_modules',
  '@react-native-mapbox-gl',
  'maps',
);

function copyFile(source, dest) {
  return new Promise((resolve, reject) => {
    fs.copy(source, dest, err => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

async function main() {
  try {
    console.log('Copying javascript');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'javascript'),
      path.join(RNGL_DIR, 'javascript'),
    );

    console.log('Copying typescript');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'index.d.ts'),
      path.join(RNGL_DIR, 'index.d.ts'),
    );

    console.log('Copying java');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'android', 'rctmgl', 'src'),
      path.join(RNGL_DIR, 'android', 'rctmgl', 'src'),
    );

    console.log('Copying gradle file');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'android', 'rctmgl', 'build.gradle'),
      path.join(RNGL_DIR, 'android', 'rctmgl', 'build.gradle'),
    );

    console.log('Copying objc');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'ios', 'RCTMGL'),
      path.join(RNGL_DIR, 'ios', 'RCTMGL'),
    );

    console.log('Copying xcode project');
    await copyFile(
      path.join(RNGL_EXAMPLE_DIR, 'ios', 'RCTMGL.xcodeproj'),
      path.join(RNGL_DIR, 'ios', 'RCTMGL.xcodeproj'),
    );
  } catch (e) {
    console.log(e);
  }
}

main();
