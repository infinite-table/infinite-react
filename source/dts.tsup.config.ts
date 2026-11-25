import { defineConfig } from 'tsup';
import { config } from './package.json';

/**
 * this is only used for generating the dts file
 */

export default defineConfig({
  entry: ['./src/index.tsx'],
  // `only` here, not the --dts-only flag: the flag replaces this whole object.
  // tsup sets `baseUrl` for its dts build, which TypeScript 6 deprecates.
  dts: { only: true, compilerOptions: { ignoreDeprecations: '6.0' } },
  tsconfig: './tsconfig.build.json',
  outDir: config.outdir,
  splitting: false,
  sourcemap: false,
  clean: true,
  onSuccess: async () => {
    console.log('dts file updated in' + config.outdir + '/index.d.ts');
  },
});
