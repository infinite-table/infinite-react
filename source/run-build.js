// TODO use a command line helper for this
const fs = require('fs');
const package = require('./package.json');
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
      __DEV__: JSON.stringify(false),
      __VERSION__: JSON.stringify(require('./package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('./package.json').publishedAt,
      ),
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
  .then(() => {
    let dts = fs.readFileSync('./dist/index.d.ts', 'utf8');

    dts = dts.replace(
      /declare module \"index\"/g,
      `declare module "${package.name}"`,
    );
    dts = dts.replace(/from \"index\"/g, `from "${package.name}"`);

    fs.writeFileSync('./dist/index.d.ts', dts, 'utf8');
  })
  .catch(() => process.exit(1));
