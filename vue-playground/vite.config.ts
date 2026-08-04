import { defineConfig } from 'vite';
import path from 'path';

// the playground consumes the actual built Vue package (source/dist-vue),
// exactly what @infinite-table/infinite-vue will ship as
export default defineConfig({
  resolve: {
    // array form: more specific entries first (object form would let the
    // bare package alias shadow the /index.css one)
    alias: [
      {
        find: '@infinite-table/infinite-vue/index.css',
        replacement: path.resolve(__dirname, '../source/dist-vue/index.css'),
      },
      {
        find: '@infinite-table/infinite-vue',
        replacement: path.resolve(__dirname, '../source/dist-vue/index.mjs'),
      },
    ],
  },
  server: {
    fs: {
      // allow serving files from the sibling source/ folder (dist-vue, themes)
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
