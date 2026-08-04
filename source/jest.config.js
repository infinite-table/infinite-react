/** @type {import('ts-jest').JestConfigWithTsJest} */

const shared = {
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

// Vue specs follow the *Vue*.jestspec.ts naming convention and run with a
// resolver that prefers .vue.ts/.vue.tsx siblings (same resolution as the
// Vue build - tsconfig moduleSuffixes / esbuild framework-resolve-plugin).
const VUE_SPEC_PATTERN = '<rootDir>/src/**/*Vue*.jestspec.@(ts|tsx)';

module.exports = {
  projects: [
    {
      ...shared,
      displayName: 'react',
      testMatch: [
        '<rootDir>/src/**/*.jestspec.ts',
        '<rootDir>/src/**/*.jestspec.tsx',
      ],
      testPathIgnorePatterns: ['/node_modules/', 'Vue[^/]*\\.jestspec\\.tsx?$'],
    },
    {
      ...shared,
      displayName: 'vue',
      testMatch: [VUE_SPEC_PATTERN],
      resolver: '<rootDir>/jest.resolver.vue.cjs',
    },
  ],
};
