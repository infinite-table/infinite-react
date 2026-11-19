import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { testPagesIndexPlugin } from './scripts/vite-plugin-test-pages-index.js';

/**
 * The Vue examples app. Lives in the same folder as the Next.js (React)
 * examples app - Next only picks up `.page.tsx` files, this app only picks
 * up `.page.vue` siblings (via import.meta.glob in src/vue-app/main.ts),
 * producing identical URL paths so one Playwright spec can run against both.
 *
 * Consumes the actual built Vue package (source/dist-vue), exactly what
 * @infinite-table/infinite-vue ships as.
 */
// this checkout's dev ports: the defaults, or other ones when those are
// taken by another checkout
const { getPort } = require('../scripts/dev-ports.cjs');

export default defineConfig(({ mode }) => {
  // the React (Next.js) test pages read process.env.NEXT_PUBLIC_* - the Vue
  // siblings use the same expressions, inlined here from the same .env files
  const env = loadEnv(mode, __dirname, 'NEXT_PUBLIC_');

  return {
    plugins: [vue(), testPagesIndexPlugin()],
    define: {
      __DEV__: JSON.stringify(true),
      __VERSION__: JSON.stringify(require('../package.json').version),
      // as if the source was published now (like the source build does) -
      // so licenses that ended before today are expired
      __VERSION_TIMESTAMP__: JSON.stringify(Date.now()),
      'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(
        env.NEXT_PUBLIC_BASE_URL,
      ),
      'process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY': JSON.stringify(
        env.NEXT_PUBLIC_INFINITE_LICENSE_KEY,
      ),
      'import.meta.env.VITE_TEST_RUNNER_PORT': JSON.stringify(
        process.env.TEST_RUNNER_PORT || String(getPort('testRunner')),
      ),
      // the React <-> Vue links of the test pages (src/test-index)
      'process.env.NEXT_PUBLIC_EXAMPLES_PORT': JSON.stringify(
        String(getPort('examples')),
      ),
      'process.env.NEXT_PUBLIC_EXAMPLES_VUE_PORT': JSON.stringify(
        String(getPort('examplesVue')),
      ),
      'import.meta.env.VITE_TEST_PROJECT': JSON.stringify('vue'),
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
      port: getPort('examplesVue'),
      strictPort: true,
      fs: {
        // allow serving files from the sibling source/ folder (dist-vue, themes)
        allow: [path.resolve(__dirname, '..')],
      },
    },
    preview: {
      port: getPort('examplesVue'),
      strictPort: true,
    },
    build: {
      outDir: 'out-vue',
    },
  };
});
