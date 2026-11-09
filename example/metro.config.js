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

// RNMBX_E2E_MAPS_IDLE=1 gives the examples a MapView that reports when it's idle, so
// e2e/docScreenshots.e2e.js can wait for it. Off by default, the example app is also documentation.
if (process.env.RNMBX_E2E_MAPS_IDLE === '1') {
  const mapsIdleTracker = path.join(__dirname, 'src/utils/MapsIdleTracker.tsx');
  const mapsIdleMarker = path.join(__dirname, 'src/utils/MapsIdleMarker.tsx');
  const { resolveRequest } = config.resolver;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
      moduleName === '@rnmapbox/maps' &&
      context.originModulePath !== mapsIdleTracker &&
      context.originModulePath.startsWith(path.join(__dirname, 'src'))
    ) {
      return { type: 'sourceFile', filePath: mapsIdleTracker };
    }
    const resolution = resolveRequest(context, moduleName, platform);
    if (
      resolution.type === 'sourceFile' &&
      resolution.filePath === mapsIdleMarker
    ) {
      return { type: 'sourceFile', filePath: mapsIdleTracker };
    }
    return resolution;
  };
}
if (config.resolver.assetExts == null) {
  config.resolver.assetExts = [];
}
config.resolver.assetExts.push('gltf', 'glb', 'png');

module.exports = config;
