import { defineConfig, Options } from 'tsup';
import type { Plugin } from 'esbuild';

// @ts-ignore
import packageJSON from './package.json';

import fs from 'fs';
import path from 'path';

import { vanillaConfig } from './tsup-vanilla-extract-config';
import { frameworkResolvePlugin } from './framework-resolve-plugin';

/**
 * Build config for @infinite-table/infinite-angular.
 *
 * Angular components can't be bundled from source: the Angular compiler
 * (ngc, tsconfig.angular.json, partial compilation) emits plain ES modules
 * into .angular-out first, keeping the file names (`Foo.angular.js`,
 * `styles.css.js`). This config then bundles that emit like the React and
 * Vue builds bundle the source:
 * - the framework resolve plugin prefers `.angular.js` siblings (TypeScript
 *   doesn't rewrite `./Foo` to `./Foo.angular`)
 * - vanilla-extract compiles the `.css.js` files, from their `.css.ts`
 *   source (see cssFromSource) so the class names are the React/Vue ones
 * - the same build-time defines
 *
 * The output is one FESM (fesm2022/infinite-angular.mjs) plus index.css -
 * the Angular Package Format layout. Run `npm run build:angular`.
 */

const resolve = path.resolve;
const { dependencies } = packageJSON;

const PUBLISHED_AT = Date.now();

const OUT_DIR = process.env.INFINITE_OUT_FOLDER || 'dist-angular';
const NGC_OUT = resolve(__dirname, '.angular-out');
const SRC = resolve(__dirname, 'src');

/**
 * The vanilla-extract class names are hashed from the file scope (the path
 * of the `.css.ts` file). Compiling the ngc copies in .angular-out would give
 * other names than the React/Vue builds (and the shared themes), so `./x.css`
 * imports from the emit resolve to src/x.css.ts.
 */
const cssFromSource: Plugin = {
  name: 'infinite-angular-css-from-source',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, (args) => {
      if (!args.resolveDir.startsWith(NGC_OUT)) {
        return null;
      }
      const emitted = resolve(args.resolveDir, args.path);
      const source = path.join(SRC, path.relative(NGC_OUT, emitted)) + '.ts';
      return fs.existsSync(source) ? { path: source } : null;
    });
  },
};

export const tsupAngularConfig: Options = {
  entry: { 'infinite-angular': './.angular-out/index.angular.js' },
  outDir: path.join(OUT_DIR, 'fesm2022'),
  format: ['esm'],
  target: 'es2022',
  outExtension: () => ({ js: '.mjs' }),
  splitting: false,
  sourcemap: false,
  // the Angular Package Format ships readable (unminified) code; the app's
  // build minifies it
  minify: false,
  bundle: true,
  clean: true,
  external: [/^@angular\//, 'rxjs', /^rxjs\//],
  // tsup externalizes the package.json dependencies by default; the package
  // has no dependencies besides Angular, so they are bundled
  noExternal: Object.keys(dependencies),
  // read by check-angular-package.cjs (the bare imports of the bundle), then removed
  metafile: true,
  onSuccess: async () => {
    const cssFrom = path.join(OUT_DIR, 'fesm2022', 'infinite-angular.css');
    if (fs.existsSync(cssFrom)) {
      fs.renameSync(cssFrom, path.join(OUT_DIR, 'index.css'));
    }

    const json: any = {
      name: '@infinite-table/infinite-angular',
      description: 'Infinite Table for Angular',
      homepage: packageJSON.homepage,
      keywords: [
        'angular',
        'infinite-table',
        'angular-table',
        'table',
        'datagrid',
        'data-grid',
        'pivot',
        'tree-grid',
      ],
      author: packageJSON.author,
      repository: packageJSON.repository,
      bugs: packageJSON.bugs,
      license: packageJSON.license,
      version: packageJSON.version,
      type: 'module',
      module: 'fesm2022/infinite-angular.mjs',
      typings: 'index.d.ts',
      exports: {
        './package.json': { default: './package.json' },
        './index.css': { default: './index.css' },
        './theme/*': { default: './theme/*' },
        '.': {
          types: './index.d.ts',
          default: './fesm2022/infinite-angular.mjs',
        },
      },
      sideEffects: ['*.css'],
      peerDependencies: {
        '@angular/core': '^22.0.0',
      },
      publishedAt: PUBLISHED_AT,
    };
    Object.keys(json).forEach((key) => {
      if (json[key] === undefined) {
        delete json[key];
      }
    });

    fs.writeFileSync(
      path.join(OUT_DIR, 'package.json'),
      JSON.stringify(json, null, 2),
      'utf8',
    );
    console.log('Files generated in ' + OUT_DIR + ' folder');
  },

  esbuildOptions: (options) => {
    // esbuild escapes non-ASCII identifiers by default (`ɵcmp` becomes
    // `ɵcmp`); the Angular linker looks for the literal
    // `ɵɵngDeclareComponent` and would silently skip the file
    options.charset = 'utf8';
    options.define = {
      // the published package is a prod build; the examples/Playwright flow
      // uses the dev build (INFINITE_DEV=true), see tsup.vue.config.ts
      __DEV__: JSON.stringify(process.env.INFINITE_DEV === 'true'),
      __VERSION__: JSON.stringify(require('./package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(PUBLISHED_AT),
    };
  },
  esbuildPlugins: [
    cssFromSource,
    frameworkResolvePlugin('angular'),
    vanillaConfig,
  ],
};

export default defineConfig(tsupAngularConfig);
