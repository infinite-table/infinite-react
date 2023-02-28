const path = require('path');

const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');

const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
});

const { remarkPlugins } = require('./plugins/markdownToHtml');

const spawnSync = require('child_process').spawnSync;

const exec = (cmd, args = []) => spawnSync(cmd, args, { stdio: 'pipe' });

const result = exec('npm', [
  'show',
  '@infinite-table/infinite-react',
  'versions',
  '--json',
]);

const versions = JSON.parse(result.stdout);

// TODO AFL: retrieve latest canary for NEXT, latest stable for master, NEXT_PUBLIC_INFINITE_REACT_VERSION for everything else
const NEXT_PUBLIC_INFINITE_REACT_VERSION =
  process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION || versions.pop();

const nextConfig = withMDX({
  env: {
    NEXT_PUBLIC_INFINITE_REACT_VERSION,
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
  images: {
    unoptimized: true,
  },
  experimental: {
    plugins: true,
    // TODO: this doesn't work because https://github.com/vercel/next.js/issues/30714
    concurrentFeatures: true,
    scrollRestoration: true,
  },

  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { dev, isServer, ...options }) {
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        }),
      );
    }
    config.plugins.push(new VanillaExtractPlugin());

    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, '../node_modules/react'),
      ['react-dom']: path.resolve(__dirname, '../node_modules/react-dom'),
      '@www': path.resolve('./src'),
      '@infinite-table/infinite-react': path.resolve(
        '../source/dist/index.esm.js',
      ),
      '@infinite-table/infinite-react/index.css': path.resolve(
        '../source/dist/index.css',
      ),
    };
    // Add our custom markdown loader in order to support frontmatter
    // and layout
    config.module.rules.push(
      {
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
      },
      {
        rules: [
          {
            test: /\.txt$/i,
            use: 'raw-loader',
          },
        ],
      },
    );

    return config;
  },
});
const createNextPluginPreval = require('next-plugin-preval/config');
const withNextPluginPreval = createNextPluginPreval();
module.exports = withNextPluginPreval(nextConfig);
