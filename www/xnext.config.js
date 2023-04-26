const path = require('path');

const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

// const { remarkPlugins } = require('./plugins/markdownToHtml');
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  // remarkPlugins,
  providerImportSource: '@mdx-js/react',
});

// const withMDX = (x) => x;

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
  // images: {
  //   unoptimized: true,
  // },
  experimental: {
    externalDir: true,
    // plugins: true,
    // concurrentFeatures: true,
    // scrollRestoration: true,
    appDir: true,
    mdxRs: true,
  },
  transpilePackages: ['@infinite-table/infinite-react'],

  // reactStrictMode: true,
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // webpack(config, { dev, isServer, ...options }) {
  //   // config.plugins.push(new VanillaExtractPlugin());

  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     react: path.resolve(__dirname, '../node_modules/react'),
  //     ['react-dom']: path.resolve(__dirname, '../node_modules/react-dom'),
  //     '@www': path.resolve('./src'),
  //     '@infinite-table/infinite-react': path.resolve(
  //       '../source/dist/index.mjs',
  //     ),
  //     '@infinite-table/infinite-react/index.css': path.resolve(
  //       '../source/dist/index.css',
  //     ),
  //   };
  //   // Add our custom markdown loader in order to support frontmatter
  //   // and layout
  //   // config.module.rules.push(
  //   //   // {
  //   //   //   test: /.mdx?$/, // load both .md and .mdx files
  //   //   //   use: [
  //   //   //     //     options.defaultLoaders.babel,
  //   //   //     //     {
  //   //   //     //       loader: '@mdx-js/loader',
  //   //   //     //       options: {
  //   //   //     //         remarkPlugins,
  //   //   //     //         mdExtensions: ['.md', '.mdx'],
  //   //   //     //       },
  //   //   //     //     },
  //   //   //     path.join(__dirname, './plugins/md-layout-loader'),
  //   //   //   ],
  //   //   // },
  //   //   // {
  //   //   //   rules: [
  //   //   //     {
  //   //   //       test: /\.txt$/i,
  //   //   //       use: 'raw-loader',
  //   //   //     },
  //   //   //   ],
  //   //   // },
  //   // );

  //   return config;
  // },
});
// const createNextPluginPreval = require('next-plugin-preval/config');
// const withNextPluginPreval = createNextPluginPreval();
// module.exports = withNextPluginPreval(nextConfig);
module.exports = withVanillaExtract(nextConfig);
