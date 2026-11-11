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

module.exports = {
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
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('../package.json').publishedAt || 0,
      ),
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
  transpilePackages: ['@infinite-table/infinite-react'],
  reactStrictMode: false, // in order to not break tests loading data by double loading
  eslint: {
    ignoreDuringBuilds: true,
  },
};
