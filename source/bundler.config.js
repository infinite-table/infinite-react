//@ts-check
module.exports = {
  compilationOptions: {
    followSymlinks: true,
    preferredConfigPath: './tsconfig.typebundler.json',
  },

  entries: [
    {
      filePath: 'dist/index.d.ts',
      outFile: 'dist/bundle.d.ts',

      failOnClass: false,

      libraries: {
        allowedTypesLibraries: [],
        importedLibraries: ['node', 'typescript'],
        inlinedLibraries: ['react', 'prop-types', 'csstype'],
      },
      output: {
        noBanner: true,
      },
    },
  ],
};
