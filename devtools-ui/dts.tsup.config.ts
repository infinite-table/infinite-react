import { defineConfig } from 'tsup';
import packageJSON from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './dts.tsconfig.json',
  outDir: 'dist',
  sourcemap: false,
  splitting: false,
  dts: true,
  clean: false,
});
