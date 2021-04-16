const { moduleNameMapper } = require('./jest.config');

module.exports = {
  preset: 'ts-jest',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: '<rootDir>/jest-teardown.js',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['expect-puppeteer', '<rootDir>/jest-puppeteer-setup.js'],
  moduleNameMapper,
  globals: {
    __DEV__: true,
    BASEURL: 'http://localhost:3000/tests/',
  },
};
