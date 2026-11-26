// next.config.js
const path = require('path');

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();

const webpack = require('webpack');
const fs = require('fs');

// `GRID_BENCHMARK=1 next build` builds ONLY the grid benchmark pages
// (src/pages/**/*.bench.tsx) as a production app, with Infinite's __DEV__
// checks turned off, into a separate distDir - so it can be built and served
// while `next dev` is running. See src/benchmark/README.md
const isGridBenchmark = !!process.env.GRID_BENCHMARK;

function readPackageVersion(name) {
  try {
    const pkg = path.resolve(__dirname, 'node_modules', name, 'package.json');
    return JSON.parse(fs.readFileSync(pkg, 'utf8')).version;
  } catch (ex) {
    return 'unknown';
  }
}

const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');

// this checkout's dev ports: the defaults, or other ones when those are
// taken by another checkout
const { getPort } = require('../scripts/dev-ports.cjs');

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  // `next dev` serves the app under /react, as the Vue and Angular dev
  // servers serve theirs under /vue and /angular, for the front of the dev
  // servers (scripts/examples-dev-server.js: the three apps on one port). The
  // static export the tests run on in CI stays at the root.
  const basePath =
    phase === PHASE_DEVELOPMENT_SERVER && !isGridBenchmark ? '/react' : '';

  return {
    ...(basePath ? { basePath } : {}),
    webpack: (config) => {
      const definePlugin = new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isGridBenchmark),
        // only used by the grid benchmark pages, for reporting
        __AG_GRID_VERSION__: JSON.stringify(
          readPackageVersion('ag-grid-community'),
        ),
        __INFINITE_VERSION__: JSON.stringify(
          require('../source/package.json').version,
        ),
        __VERSION__: JSON.stringify(require('../package.json').version),
        // as if the source was published now (like the source build does) -
        // so licenses that ended before today are expired
        __VERSION_TIMESTAMP__: JSON.stringify(Date.now()),
      });

      config.plugins.push(definePlugin);

      config.resolve.alias['react'] = path.resolve('./node_modules/react');
      config.resolve.alias['react-dom'] = path.resolve(
        './node_modules/react-dom',
      );

      // for whatever reason, due to the monorepo setup
      // we cannot use the vanilla-extract plugin for next
      // so we're using the webpack plugin directly
      config.plugins.push(new VanillaExtractPlugin());

      return config;
    },
    ...(isGridBenchmark
      ? {
          distDir: '.next-benchmark',
          pageExtensions: ['bench.tsx'],
          // type-checking the whole examples project would dominate the build
          typescript: { ignoreBuildErrors: true },
        }
      : {
          output: 'export',
          pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
        }),
    env: {
      // read by the test index pages (src/test-index)
      NEXT_PUBLIC_TEST_RUNNER_PORT: String(getPort('testRunner')),
      NEXT_PUBLIC_EXAMPLES_PORT: String(getPort('examples')),
      NEXT_PUBLIC_EXAMPLES_VUE_PORT: String(getPort('examplesVue')),
      NEXT_PUBLIC_EXAMPLES_ANGULAR_PORT: String(getPort('examplesAngular')),
      NEXT_PUBLIC_EXAMPLES_DEV_PORT: String(getPort('examplesDev')),
      // the links of the test index pages, in the static HTML too
      NEXT_PUBLIC_EXAMPLES_BASE_PATH: basePath,
    },
    transpilePackages: ['@infinite-table/infinite-react'],
    reactStrictMode: false, // in order to not break tests loading data by double loading
    eslint: {
      ignoreDuringBuilds: true,
    },
  };
};
