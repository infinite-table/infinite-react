const fs = require('fs');
const path = require('path');

const packageJSON = require('./src/utils/DeepMap/package.json');
const format = process.argv[2];
const watch = process.argv[3] === '--watch';

if (!format || !(format in { esm: true, cjs: true })) {
  throw 'Invalid format supplied';
}

require('esbuild')
  .build({
    entryPoints: [path.resolve(__dirname, 'src/utils/DeepMap/index.ts')],
    bundle: true,
    plugins: [],
    define: {},
    watch: watch
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error);
            else console.log('watch build succeeded:', result);
          },
        }
      : null,
    external: [],
    format: format,
    bundle: true,
    platform: 'browser',
    outfile: path.resolve(
      __dirname,
      `dist-deepmap/index${format === 'esm' ? '.esm' : ''}.js`,
    ),
  })
  .then(() => {
    try {
      fs.writeFileSync(
        path.resolve(__dirname, './dist-deepmap/package.json'),
        JSON.stringify(packageJSON, null, 2),
        'utf8',
      );
    } catch (ex) {
      console.error('Cannot find or write dist-deepmap/package.json');
      console.error(ex);
    }
  })
  .catch(() => process.exit(1));
