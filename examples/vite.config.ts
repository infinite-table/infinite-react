import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * The Vue examples app. Lives in the same folder as the Next.js (React)
 * examples app - Next only picks up `.page.tsx` files, this app only picks
 * up `.page.vue` siblings (via import.meta.glob in src/vue-app/main.ts),
 * producing identical URL paths so one Playwright spec can run against both.
 *
 * Consumes the actual built Vue package (source/dist-vue), exactly what
 * @infinite-table/infinite-vue ships as.
 */
export default defineConfig(({ mode }) => {
  // the React (Next.js) test pages read process.env.NEXT_PUBLIC_* - the Vue
  // siblings use the same expressions, inlined here from the same .env files
  const env = loadEnv(mode, __dirname, 'NEXT_PUBLIC_');

  return {
    plugins: [vue()],
    define: {
      __DEV__: JSON.stringify(true),
      __VERSION__: JSON.stringify(require('../package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('../package.json').publishedAt || 0,
      ),
      'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(
        env.NEXT_PUBLIC_BASE_URL,
      ),
      'process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY': JSON.stringify(
        env.NEXT_PUBLIC_INFINITE_LICENSE_KEY,
      ),
    },
    resolve: {
      // array form: more specific entries first
      alias: [
        {
          find: '@infinite-table/infinite-vue/index.css',
          replacement: path.resolve(__dirname, '../source/dist-vue/index.css'),
        },
        {
          find: '@infinite-table/infinite-vue',
          replacement: path.resolve(__dirname, '../source/dist-vue/index.mjs'),
        },
        {
          find: '@examples',
          replacement: path.resolve(__dirname, './src'),
        },
        {
          // shared utils imported by test-page config modules
          find: '@src',
          replacement: path.resolve(__dirname, '../source/src'),
        },
      ],
    },
    css: {
      // don't pick up the repo's postcss.config.mjs (tailwind) - it's only
      // needed by the Next.js demo pages, not by the Vue test pages
      postcss: {},
    },
    server: {
      port: 5556,
      strictPort: true,
      fs: {
        // allow serving files from the sibling source/ folder (dist-vue, themes)
        allow: [path.resolve(__dirname, '..')],
      },
    },
    preview: {
      port: 5556,
      strictPort: true,
    },
    build: {
      outDir: 'out-vue',
    },
  };
});
