const path = require('path');

const pak = require('../package.json');

module.exports = {
  dependencies: {
    [pak.name]: {
      root: path.join(__dirname, '..'),
    },
  },
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
};
