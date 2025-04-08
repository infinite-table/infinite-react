import { defineConfig } from 'tsup';
import packageJSON from './package.json';
import dotenv from 'dotenv';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';
import path from 'path';
const { parsed } = dotenv.config({ path: ['.env.local', '.env'] });

const dependencies = { ...packageJSON.dependencies };

const external = ['react', 'react-dom'];

external.forEach((key) => {
  //@ts-ignore
  delete dependencies[key];
});

export default defineConfig({
  entry: ['src/index.ts', 'src/index.css'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  bundle: true,
  format: 'esm',
  cjsInterop: true,
  noExternal: Object.keys(dependencies),
  //@ts-ignore
  esbuildPlugins: [vanillaExtractPlugin()],
  alias: {
    '@infinite-table/infinite-react': path.resolve(__dirname, '../source/dist'),
    '@infinite-table/infinite-react/index.css': path.resolve(
      __dirname,
      '../source/dist/index.css',
    ),
  },
  external,

  define: {
    __DEV__: JSON.stringify(false),
    'process.env.INFINITE_TABLE_LICENSE_KEY': JSON.stringify(
      (parsed || {}).INFINITE_LICENSE_KEY || '',
    ),
  },
});
