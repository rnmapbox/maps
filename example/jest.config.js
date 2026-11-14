const path = require('path');

/** @type {import('jest').Config} */
const config = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.ts'],
  verbose: true,
  moduleNameMapper: {
    '^@rnmapbox/maps$': path.resolve(__dirname, '../src/index.ts'),
  },
};

module.exports = config;
