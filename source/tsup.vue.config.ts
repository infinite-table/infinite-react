import { defineConfig, Format, Options } from 'tsup';

// @ts-ignore
import packageJSON from './package.json';

import fs from 'fs';
import path from 'path';

import { vanillaConfig } from './tsup-vanilla-extract-config';
import { frameworkResolvePlugin } from './framework-resolve-plugin';

/**
 * Build config for @infinite-table/infinite-vue.
 *
 * Same single source tree as the React build (tsup.config.ts); the only
 * differences are:
 * - the framework resolve plugin prefers `.vue.tsx/.vue.ts` siblings
 * - the entry is the Vue public API (src/index.vue.tsx — lands in Phase 2)
 * - output goes to dist-vue with a package.json rewritten for the vue package
 *
 * Run with: tsup --config tsup.vue.config.ts
 * (not wired into CI until the Vue entry exists)
 */

const resolve = path.resolve;
const { dependencies } = packageJSON;

const OUT_DIR = 'dist-vue';
const FORMATS: Format[] = ['cjs', 'esm'];

export const tsupVueConfig: Options = {
  // index.vue.tsx is the Vue public API entry; the output is named `index`
  // so the generated package.json main/module fields (index.js / index.mjs)
  // resolve correctly.
  entry: { index: './src/index.vue.tsx' },

  tsconfig: './tsconfig.vue.json',
  outDir: OUT_DIR,
  splitting: false,
  sourcemap: false,
  format: FORMATS,
  minify: true,
  bundle: true,
  clean: false,
  external: ['vue'],
  noExternal: Object.keys(dependencies),
  onSuccess: async () => {
    console.log('Files generated in ' + OUT_DIR + ' folder');

    const json: any = { ...packageJSON };

    const toDelete = [
      'devDependencies',
      'dependencies',
      'husky',
      'prettier',
      'files',
      'lint-staged',
      'scripts',
      'private',
      'config',
    ];
    toDelete.forEach((key) => delete json[key]);

    json.name = '@infinite-table/infinite-vue';
    json.description = 'Infinite Table for Vue';
    json.keywords = ['vue', 'infinite-table', 'vue-table', 'table', 'datagrid'];
    json.main = 'index.js';
    json.module = 'index.mjs';
    json.typings = 'index.d.ts';
    json.peerDependencies = { vue: '>=3.4' };
    json.publishedAt = Date.now();

    const content = JSON.stringify(json, null, 2);

    fs.writeFileSync(resolve(__dirname, OUT_DIR, 'package.json'), content, 'utf8');
    console.log('DONE building vue package.json with version ', json.version);
  },

  esbuildOptions: (options) => {
    options.define = {
      // the published package is a prod build; the examples/Playwright flow
      // needs the dev build (INFINITE_DEV=true) because test pages rely on
      // __DEV__-only hooks (e.g. globalThis.state set by the DataSource
      // reducer) - the React examples get this implicitly since they compile
      // the source with __DEV__ true
      __DEV__: JSON.stringify(process.env.INFINITE_DEV === 'true'),
      __VERSION__: JSON.stringify(require('./package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('./package.json').publishedAt,
      ),
    };
    // Vue siblings are written with Vue JSX; the shared React files never
    // enter this build (the entry graph only pulls shared TS + .vue siblings)
    options.jsx = 'automatic';
    options.jsxImportSource = 'vue';
  },
  esbuildPlugins: [frameworkResolvePlugin('vue'), vanillaConfig],
};

export default defineConfig(tsupVueConfig);
