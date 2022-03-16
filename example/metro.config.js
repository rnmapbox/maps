/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');

/*
  See

  https://medium.com/@dushyant_db/how-to-import-files-from-outside-of-root-directory-with-react-native-metro-bundler-18207a348427
*/

// exclusionList is a function that takes an array of regexes and combines
// them with the default exclusions to return a single regex.
const exclusionList = require('metro-config/src/defaults/exclusionList');
const glob = require('glob-to-regexp');

const extraNodeModules = {
  '@rnmapbox/maps': path.resolve(__dirname + '/../maps'),
};

function getBlacklist() {
  const nodeModuleDirs = [
    glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
    glob(`${path.resolve(__dirname, '..')}/docs/*`),
    glob(`${path.resolve(__dirname, '..')}/e2e/*`),
    glob(`${path.resolve(__dirname)}/node_modules/*/node_modules/fbjs/*`),
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
  return exclusionList(nodeModuleDirs);
}

module.exports = {
  resolver: {
    blacklistRE: getBlacklist(),
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) => {
        return name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`);
      },
    }),
  },
  watchFolders: [path.resolve(__dirname, '..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
