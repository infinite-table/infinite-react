import { defineConfig, Format } from 'tsup';

// @ts-ignore
import packageJSON from './package.json';

import fs from 'fs';
import path from 'path';

const resolve = path.resolve;
const { config, dependencies } = packageJSON;

Object.freeze(packageJSON);

import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

async function processCss(css) {
  const result = await postcss([autoprefixer]).process(css, {
    from: undefined /* suppress source map warning */,
  });

  return result.css;
}

// CHANGE HERE TO ADD ESM AS WELL
const FORMATS: Format[] = ['cjs', 'esm'];

export default defineConfig({
  entry: ['./src/index.tsx'],

  tsconfig: './tsconfig.build.json',
  outDir: config.outdir,
  splitting: false,
  sourcemap: false,
  format: FORMATS,
  minify: true,
  bundle: true,
  clean: true,
  external: ['react', 'react-dom'],
  /**
   * tsup is a LOT more aggresive than esbuild in terms of externalizing dependencies.
   * This is a workaround to prevent it from not bundling the dependencies that need to be included in the bundle
   */
  noExternal: Object.keys(dependencies),
  onSuccess: async () => {
    console.log('Files generated in ' + config.outdir + ' folder');

    const json = { ...packageJSON };

    const toDelete = [
      'devDependencies',
      'husky',
      'prettier',
      'files',
      'lint-staged',
      'scripts',
      'private',
    ];
    toDelete.forEach((key) => delete json[key]);

    ['main', 'module', 'typings'].forEach((key) => {
      let value = json[key];

      value = value.split('/');
      if (value[0] === 'dist') {
        value = value.splice(1).join('/');
      }

      json[key] = value.join('/');
    });

    json.publishedAt = Date.now();
    const content = JSON.stringify(json, null, 2);

    const path = resolve(__dirname, config.outdir, 'package.json');
    fs.writeFile(path, content, 'utf8', (err) => {
      if (err) {
        console.error(err);
        throw err;
      } else {
        console.log('DONE building package.json with version ', json.version);
      }
    });
  },

  esbuildOptions: (options) => {
    options.define = {
      __DEV__: JSON.stringify(false),
      __VERSION__: JSON.stringify(require('./package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('./package.json').publishedAt,
      ),
    };
  },
  esbuildPlugins: [
    vanillaExtractPlugin({
      processCss,
    }),
  ],
});
