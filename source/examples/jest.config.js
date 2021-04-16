module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/../src/$1',
    '^@components/(.*)$': '<rootDir>/../src/components/$1',
  },
};
