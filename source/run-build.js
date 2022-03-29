const { vanillaExtractPlugin } = require('@vanilla-extract/esbuild-plugin');

const format = process.argv[2];
const watch = process.argv[3] === '--watch';

if (!format || !(format in { esm: true, cjs: true })) {
  throw 'Invalid format supplied';
}

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

async function processCss(css) {
  const result = await postcss([autoprefixer]).process(css, {
    from: undefined /* suppress source map warning */,
  });

  return result.css;
}

require('esbuild').build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  plugins: [vanillaExtractPlugin({ processCss, identifiers: 'short' })],
  define: {
    __DEV__: JSON.stringify(true),
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
});
