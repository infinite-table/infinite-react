import { defineConfig } from 'tsup';

/**
 * Bundles the type declarations of the Angular package
 * (dist-angular/index.d.ts).
 *
 * The entry is the ngc emit, not the source: only ngc writes the static Ivy
 * members (`ɵcmp`, `ɵfac`, `ɵdir`) that an Angular app's compiler needs to
 * type-check the inputs and outputs of the components in its templates.
 */
const OUT_DIR = process.env.INFINITE_OUT_FOLDER || 'dist-angular';

export default defineConfig({
  entry: { index: './.angular-out/index.angular.d.ts' },
  // `only` here, not the --dts-only flag (the flag replaces this whole object)
  dts: {
    only: true,
    // tsup sets `baseUrl` for its dts build, which TypeScript 6 deprecates
    compilerOptions: { ignoreDeprecations: '6.0' },
  },
  // moduleSuffixes, so `./Foo` resolves to the Foo.angular.d.ts sibling
  tsconfig: './tsconfig.angular.dts.json',
  outDir: OUT_DIR,
  splitting: false,
  sourcemap: false,
  clean: false,
  external: [/^@angular\//, 'rxjs', /^rxjs\//],
});
