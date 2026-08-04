import fs from 'fs';
import path from 'path';
import type { Plugin } from 'esbuild';

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * esbuild plugin implementing framework sibling-file resolution.
 *
 * Given `import { X } from './Foo'`, the plugin resolves to `./Foo.<framework>.tsx`
 * (or .ts) when such a sibling exists, falling back to esbuild's default
 * resolution (`./Foo.tsx`) otherwise. This mirrors TypeScript's `moduleSuffixes`
 * option (see tsconfig.react.json / tsconfig.vue.json), so the same import
 * specifier resolves to the per-framework implementation in both the
 * typechecker and the bundler — the React Native `.ios.ts` pattern.
 *
 * Imports never mention the suffix; a file is shared by default and gains a
 * `.react.tsx` sibling only when a second framework implementation exists.
 */
export function frameworkResolvePlugin(framework: string): Plugin {
  return {
    name: `framework-sibling-resolve:${framework}`,
    setup(build) {
      // only relative imports participate in sibling resolution
      build.onResolve({ filter: /^\.\.?\// }, (args) => {
        if (
          args.kind !== 'import-statement' &&
          args.kind !== 'require-call' &&
          args.kind !== 'dynamic-import'
        ) {
          return null;
        }

        const base = path.resolve(args.resolveDir, args.path);

        for (const ext of EXTENSIONS) {
          const candidate = `${base}.${framework}${ext}`;
          if (fs.existsSync(candidate)) {
            return { path: candidate };
          }
        }

        // directory imports: prefer index.<framework>.tsx over index.tsx
        for (const ext of EXTENSIONS) {
          const candidate = path.join(base, `index.${framework}${ext}`);
          if (fs.existsSync(candidate)) {
            return { path: candidate };
          }
        }

        // fall through to default resolution
        return null;
      });
    },
  };
}
