import fs from 'fs';
import path from 'path';
import type { Plugin } from 'esbuild';

/**
 * esbuild plugin for bundling the Angular compiler's emit (`.angular-out`,
 * see tsconfig.angular.json): its `./x.css` imports resolve to the
 * `src/x.css.ts` source instead of the emitted `x.css.js`.
 *
 * The vanilla-extract class names are hashed from the file scope (the path
 * of the `.css.ts` file). Compiling the ngc copies would give other names
 * than the React and Vue builds (and the shared themes).
 *
 * Used by the package build (tsup.angular.config.ts) and by the docs demos
 * (www/docs-kit.config.mjs). `sourceDir` is this folder (`source/`).
 */
export function angularCssFromSourcePlugin(sourceDir: string): Plugin {
  const ngcOut = path.join(sourceDir, '.angular-out');
  const src = path.join(sourceDir, 'src');
  return {
    name: 'infinite-angular-css-from-source',
    setup(build) {
      build.onResolve({ filter: /\.css$/ }, (args) => {
        if (!args.resolveDir.startsWith(ngcOut)) {
          return null;
        }
        const emitted = path.resolve(args.resolveDir, args.path);
        const source = path.join(src, path.relative(ngcOut, emitted)) + '.ts';
        return fs.existsSync(source) ? { path: source } : null;
      });
    },
  };
}
