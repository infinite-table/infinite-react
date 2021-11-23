const path = require('path');
const {
  createVanillaExtractPlugin,
} = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
});

const {
  remarkPlugins,
} = require('./plugins/markdownToHtml');

const nextConfig = withMDX({
  async redirects() {
    return [
      {
        source: '/docs/learn/getting-started',
        destination: '/docs/latest/learn/getting-started',
        permanent: true,
      },
    ];
  },
  pageExtensions: ['page.tsx', 'page.mdx', 'page.md'],
  rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: '/_next/static/feed.xml',
      },
    ];
  },
  experimental: {
    plugins: true,
    // TODO: this doesn't work because https://github.com/vercel/next.js/issues/30714
    // concurrentFeatures: true,
    scrollRestoration: true,
  },

  reactStrictMode: true,
  webpack(config, { dev, isServer, ...options }) {
    if (process.env.ANALYZE) {
      const {
        BundleAnalyzerPlugin,
      } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }
    config.resolve.alias['@www'] = path.resolve('./src');
    config.resolve.alias['@infinite-table/infinite-react'] =
      path.resolve('../source/dist/index.esm.js');
    config.resolve.alias[
      '@infinite-table/infinite-react/index.css'
    ] = path.resolve('../source/dist/index.css');
    config.resolve.alias.react = path.resolve(
      './node_modules/react'
    );
    config.resolve.alias['react-dom'] = path.resolve(
      './node_modules/react-dom'
    );
    // needed for bundling the ts-compiler for browser usage
    // config.resolve.alias['os'] = path.resolve(
    //   './build/shims/os-shim.js'
    // );
    // config.resolve.alias['fs'] = path.resolve(
    //   './node_modules/node-browserfs'
    // );
    // config.resolve.alias['perf_hooks'] = path.resolve(
    //   './build/shims/perf_hooks.js'
    // );
    // config.resolve.alias['path'] = path.resolve(
    //   './node_modules/path-browserify'
    // );

    // Add our custom markdown loader in order to support frontmatter
    // and layout
    config.module.rules.push({
      test: /.mdx?$/, // load both .md and .mdx files
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins,
          },
        },
        path.join(__dirname, './plugins/md-layout-loader'),
      ],
    });

    return config;
  },
});
const createNextPluginPreval = require('next-plugin-preval/config');
const { IgnorePlugin } = require('webpack');
const withNextPluginPreval = createNextPluginPreval();
module.exports = withNextPluginPreval(
  withVanillaExtract(nextConfig)
);
