import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'react-native',
  roots: ['__tests__/'],
  setupFilesAfterEnv: [
    './setup-jest.js',
    './__tests__/__mocks__/react-native.mock.js',
  ],
  modulePathIgnorePatterns: [
    'example',
    '__tests__/__mocks__',
    'fixtures',
    '<rootDir>/lib/',
  ],
  moduleNameMapper: {
    '^@rnmapbox/maps$': '<rootDir>/src',
  },
};

export default config;
