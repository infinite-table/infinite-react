import type { NextConfig } from 'next';
import path from 'path';

import webpack from 'webpack';

import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.js'],
  transpilePackages: ['devtools-ui', '@infinite-table/infinite-react'],
};

const withApp = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    //@ts-ignore
    webpack(config, options) {
      const definePlugin = new webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
        __VERSION__: JSON.stringify(require('../package.json').version),
        __VERSION_TIMESTAMP__: JSON.stringify(
          require('../package.json').publishedAt || 0,
        ),
      });

      config.plugins.push(definePlugin);
      config.plugins.push(new VanillaExtractPlugin());

      // needed in order to avoid 2 copies of react being included, which makes hooks not work
      // and also to pick up the current infinite version
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['@infinite-table/infinite-react'] = path.resolve(
        'node_modules/@infinite-table/infinite-react',
      );
      config.resolve.alias.react = path.resolve(
        '../devtools-ui/node_modules/react',
      );
      config.resolve.alias['react-dom'] = path.resolve(
        '../devtools-ui/node_modules/react-dom',
      ); //@ts-ignore
      if (typeof nextConfig.webpack === 'function') {
        //@ts-ignore
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};

export default withApp(nextConfig);
