/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  testMatch: ['<rootDir>/src/**/*.jestspec.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
  transform: {
    '\\.css\\.ts$': '@vanilla-extract/jest-transform',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
