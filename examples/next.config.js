// next.config.js

const webpack = require('webpack');

const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');

module.exports = {
  webpack: (config) => {
    const definePlugin = new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
      __VERSION__: JSON.stringify(require('../package.json').version),
      __VERSION_TIMESTAMP__: JSON.stringify(
        require('../package.json').publishedAt || 0,
      ),
    });

    config.plugins.push(definePlugin);
    // for whatever reason, due to the monorepo setup
    // we cannot use the vanilla-extract plugin for next
    // so we're using the webpack plugin directly
    config.plugins.push(new VanillaExtractPlugin());

    return config;
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
  transpilePackages: ['@infinite-table/infinite-react'],
  reactStrictMode: false, // in order to not break tests loading daa by double loading
  eslint: {
    ignoreDuringBuilds: true,
  },
};
