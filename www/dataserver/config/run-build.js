// TODO use a command line helper for this
const format = process.argv[2];
const watch = process.argv[3] === '--watch';

if (!format || !(format in { esm: true, cjs: true })) {
  throw 'Invalid format supplied';
}

require('esbuild')
  .build({
    entryPoints: ['./cli.ts', './add-dates.ts', './add-monthly-bonus'],
    bundle: true,
    watch: watch
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error);
            else console.log('watch build succeeded:', result);
          },
        }
      : null,
    external: ['commander', 'faker'],
    format: format,
    bundle: true,
    platform: 'node',

    outdir: `./bin`,
  })
  .catch(() => process.exit(1));
