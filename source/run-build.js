const format = process.argv[2];
if (!format || !(format in { esm: true, cjs: true })) {
  throw 'invalid format supplied';
}
require('esbuild')
  .build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    define: {
      __DEV__: 'false',
    },
    external: ['react', 'react-dom'],
    format: format,
    bundle: true,
    platform: 'browser',
    outfile: `dist/index${format === 'esm' ? '.esm' : ''}.js`,
  })
  .catch(() => process.exit(1));
