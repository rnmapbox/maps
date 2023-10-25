const path = require('path');

const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const libPackageJson = require('../package.json');

const root = path.resolve(__dirname, '..');

const libPeerDependencies = Object.keys(libPackageJson.peerDependencies)
  .concat(['@babel/runtime'])
  .concat(Object.keys(libPackageJson.dependencies));

module.exports = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we exclude them at the root, and alias them to the versions in example's node_modules
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
