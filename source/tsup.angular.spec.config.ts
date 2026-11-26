import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

import { vanillaConfig } from './tsup-vanilla-extract-config';
import { frameworkResolvePlugin } from './framework-resolve-plugin';

/**
 * Bundles the ngc-compiled Angular unit tests (.angular-spec-out, see
 * tsconfig.angular.spec.json) for Vitest: one bundle per spec, with the same
 * `.angular` sibling resolution, vanilla-extract styles and defines as the
 * package. Angular, rxjs and vitest stay external.
 */
const SPEC_OUT = path.resolve(__dirname, '.angular-spec-out');

function findSpecs(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findSpecs(file);
    }
    return entry.name.endsWith('.spec.angular.js') ? [file] : [];
  });
}

const entry = Object.fromEntries(
  findSpecs(SPEC_OUT).map((file) => [
    path.relative(SPEC_OUT, file).replace(/\.js$/, ''),
    file,
  ]),
);

export default defineConfig({
  entry,
  outDir: '.angular-spec-bundles',
  format: ['esm'],
  outExtension: () => ({ js: '.mjs' }),
  target: 'es2022',
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [/^@angular\//, 'rxjs', /^rxjs\//, 'vitest'],
  noExternal: [/^(?!@angular\/|rxjs|vitest)/],
  esbuildOptions: (options) => {
    options.charset = 'utf8';
    options.define = {
      __DEV__: JSON.stringify(true),
      __VERSION__: JSON.stringify(require('./package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(Date.now()),
    };
  },
  esbuildPlugins: [frameworkResolvePlugin('angular'), vanillaConfig],
});
