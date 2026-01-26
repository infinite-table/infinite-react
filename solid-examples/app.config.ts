import { defineConfig } from '@solidjs/start/config';
import path from 'node:path';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const __dirname = path.resolve();

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, '../solid-source/src'),
        '@infinite': path.resolve(__dirname, '../source/src'),
      },
    },
    plugins: [vanillaExtractPlugin()],
  },
});
