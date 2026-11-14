module.exports = {
  maxWorkers: 1,
  testTimeout: 120000,
  verbose: true,
  rootDir: '..',
  // Without watchman (CI) crawling all of example/, including ios/build, takes minutes
  roots: ['<rootDir>/e2e'],
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  reporters: ['detox/runners/jest/reporter'],
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  testEnvironment: '<rootDir>/e2e/environment.js',
};
