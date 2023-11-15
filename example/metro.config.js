/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const path = require('path');
const fs = require('fs');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');
const glob = require('glob-to-regexp');

const assetRegistryPath = fs
  .realpathSync(require.resolve('react-native/Libraries/Image/AssetRegistry'))
  .replace('.js', '');

const inlineRequireBlockList = new Proxy(
  {},
  {
    has: (target, name) => {
      if (
        (name.endsWith('.js') &&
          name.includes('/react-navigation-stack/lib/module/vendor/views/')) ||
        (name.includes('@react-navigation/elements/src/') &&
          name.endsWith('.tsx'))
      ) {
        return true;
      }
      return false;
    },
  },
);

function getBlacklist() {
  const nodeModuleDirs = [
    glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
    glob(`${path.resolve(__dirname, '..')}/docs/*`),
    glob(`${path.resolve(__dirname, '..')}/e2e/*`),
    glob(
      `${path.resolve(__dirname)}/node_modules/*/node_modules/lodash.isequal/*`,
    ),
    glob(
      `${path.resolve(
        __dirname,
      )}/node_modules/*/node_modules/hoist-non-react-statics/*`,
    ),
    glob(
      `${path.resolve(
        __dirname,
      )}/node_modules/react-native/node_modules/@babel/*`,
    ),
  ];
  const webSupportSources = [
    glob(`${path.resolve(__dirname, '..')}/src/web/*`),
  ];
  return blacklist([...nodeModuleDirs, ...webSupportSources]);
}

const config = {
  resolver: {
    blacklistRE: getBlacklist(),
  },
  watchFolders: [path.resolve(__dirname, '..')],
  transformer: {
    assetRegistryPath: assetRegistryPath,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: { blockList: inlineRequireBlockList },
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
