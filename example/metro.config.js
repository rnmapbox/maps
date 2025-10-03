const path = require('path');

// Detect if we're running inside Expo
const isExpo = !!process.env.EXPO_DEV_SERVER_ORIGIN;

const { getDefaultConfig } = isExpo
  ? require('@expo/metro-config')
  : require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

config.resolver.unstable_enablePackageExports = true;
if (config.resolver.assetExts == null) {
  config.resolver.assetExts = [];
}
config.resolver.assetExts.push('gltf', 'glb', 'png');

module.exports = config;
