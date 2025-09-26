const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const result = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

const extraNodeModuleNames = []; //['@babel/runtime'];
const extraNodeModules = extraNodeModuleNames.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

module.exports = {
  ...result,
  resolver: {
    ...result.resolver,
    extraNodeModules: {
      ...result.resolver.extraNodeModules,
      ...extraNodeModules,
    },

    assetExts: [...(result.resolver.assetExts ?? []), 'gltf', 'glb', 'png'],
  },
};

