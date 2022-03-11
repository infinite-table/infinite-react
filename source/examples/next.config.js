// next.config.js
const path = require('path');
const webpack = require('webpack');
const examplesFolder = path.resolve(__dirname);
const parentFolder = path.resolve(__dirname, '../');

const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/**
 * This is here to make nextjs compile the src folder, which is outside the examples folder
 */

const withParentFolder = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      // needed in order to avoid 2 copies of react being included, which makes hooks not work
      // config.resolve = config.resolve || {};
      // config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, '../node_modules/react'),
        ['react-dom']: path.resolve(__dirname, '../node_modules/react-dom'),
        '@infinite-table/infinite-react': path.resolve(__dirname, '../src/'),
        '@src': path.resolve(__dirname, '../src'),
        '@examples': path.resolve(__dirname, './src'),
      };

      const definePlugin = new webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
        __VERSION__: JSON.stringify(require('../package.json').version),
        __VERSION_TIMESTAMP__: JSON.stringify(
          require('../package.json').publishedAt || 0,
        ),
      });

      config.plugins.push(definePlugin);

      return config;
    },
  });
};
module.exports = withVanillaExtract({
  ...withParentFolder(),
  pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    externalDir: true,
  },
});
