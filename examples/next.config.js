// next.config.js
const path = require('path');

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();

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
  output: 'export',
  pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
  transpilePackages: ['@infinite-table/infinite-react'],
  reactStrictMode: false, // in order to not break tests loading data by double loading
  eslint: {
    ignoreDuringBuilds: true,
  },
};
