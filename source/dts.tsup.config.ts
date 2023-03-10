import { defineConfig } from 'tsup';
import { config } from './package.json';

/**
 * this is only used for generating the dts file
 */

export default defineConfig({
  entry: ['./src/index.tsx'],
  dts: true,
  tsconfig: './tsconfig.build.json',
  outDir: config.outdir,
  splitting: false,
  sourcemap: false,
  clean: true,
  onSuccess: async () => {
    console.log('dts file updated in' + config.outdir + '/index.d.ts');
  },
});
