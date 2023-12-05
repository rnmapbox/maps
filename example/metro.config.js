const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const root = path.resolve(__dirname, '..');

const libPackageJson = require('../package.json');

const libPeerDependencies = Object.keys(libPackageJson.peerDependencies)
  .concat(['@babel/runtime'])
  .concat(Object.keys(libPackageJson.dependencies));

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    blacklistRE: exclusionList(
      libPeerDependencies.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
    ),

    extraNodeModules: libPeerDependencies.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),

    assetExts: [...defaultConfig.resolver.assetExts, 'gltf', 'glb'],
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
