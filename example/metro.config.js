// https://github.com/callstack/react-native-builder-bob/blob/main/packages/create-react-native-library/templates/expo-library/example/metro.config.js
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const root = path.resolve(__dirname, '..');

const libPackageJson = require('../package.json');

const libPeerDependencies = Object.keys(libPackageJson.peerDependencies)
  .concat([
    '@babel/runtime',
    'react-native-web',
    '@react-native/assets-registry',
  ])
  .concat(Object.keys(libPackageJson.dependencies));

const modules = libPeerDependencies;

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  ...defaultConfig,

  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    ...defaultConfig.resolver,

    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`),
      ),
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),

    assetExts: [...defaultConfig.resolver.assetExts, 'gltf', 'glb'],
  },

  transformer: {
    ...defaultConfig.transformer,

    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

const fixWebExportToUseWebSuffixForRNMBX = true;
if (fixWebExportToUseWebSuffixForRNMBX) {
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    let result = null;
    if (platform === 'web' && moduleName === path.join(root, 'src', 'index')) {
      result = context.resolveRequest(context, moduleName + '.web', platform);
    } else {
      result = context.resolveRequest(context, moduleName, platform);
    }
    return result;
  };
}

const debugModuleResolution = false;
if (debugModuleResolution) {
  config.maxWorkers = 1;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    let result = null;
    if (platform === 'web' && moduleName === path.join(root, 'src', 'index')) {
      result = context.resolveRequest(context, moduleName + '.web', platform);
    } else {
      result = context.resolveRequest(context, moduleName, platform);
    }
    console.log(
      ' => resolveRequest',
      context.originModulePath,
      moduleName,
      platform,
      result,
    );
    return result;
  };
}

module.exports = config;
