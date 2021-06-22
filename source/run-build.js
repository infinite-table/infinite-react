// TODO use a command line helper for this
const format = process.argv[2];
const watch = process.argv[3] === '--watch';

if (!format || !(format in { esm: true, cjs: true })) {
  throw 'Invalid format supplied';
}

require('esbuild')
  .build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    define: {
      __DEV__: 'false',
    },
    watch: watch
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error);
            else console.log('watch build succeeded:', result);
          },
        }
      : null,
    external: ['react', 'react-dom'],
    format: format,
    bundle: true,
    platform: 'browser',
    outfile: `dist/index${format === 'esm' ? '.esm' : ''}.js`,
  })
  .catch(() => process.exit(1));
