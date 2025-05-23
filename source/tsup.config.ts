import { defineConfig, Format, Options } from 'tsup';

// @ts-ignore
import packageJSON from './package.json';

import fs from 'fs';
import path from 'path';

const resolve = path.resolve;
const { config, dependencies } = packageJSON;

Object.freeze(packageJSON);

import { vanillaConfig } from './tsup-vanilla-extract-config';

// CHANGE HERE TO ADD ESM AS WELL
const FORMATS: Format[] = ['cjs', 'esm'];

const MINIFY = true;

export const tsupConfig: Options = {
  entry: ['./src/index.tsx'],

  tsconfig: './tsconfig.build.json',
  outDir: config.outdir,
  splitting: false,
  sourcemap: false,
  format: FORMATS,
  minify: MINIFY,
  bundle: true,
  clean: false,
  external: ['react', 'react-dom'],
  /**
   * tsup is a LOT more aggresive than esbuild in terms of externalizing dependencies.
   * This is a workaround to prevent it from not bundling the dependencies that need to be included in the bundle.
   * That is tsup was not including the dependencies that are used in the codebase, so we need to prevent this behavior and instead
   * include all dependencies in the bundle.
   */
  noExternal: Object.keys(dependencies),
  onSuccess: async () => {
    console.log('Files generated in ' + config.outdir + ' folder');

    const json = { ...packageJSON };

    const toDelete = [
      'devDependencies',
      'dependencies',
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
  esbuildPlugins: [vanillaConfig],
};

export default defineConfig(tsupConfig);
