const path = require('path');

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();
// const { remarkPlugins } = require('./plugins/markdownToHtml');
// const withMDX = require('@next/mdx')({
//   extension: /\.(md|mdx)$/,
//   // remarkPlugins,
//   providerImportSource: '@mdx-js/react',
// });

const withMDX = require('@next/mdx')();

// const withMDX = (x) => x;
const spawnSync = require('child_process').spawnSync;

const exec = (cmd, args = []) => spawnSync(cmd, args, { stdio: 'pipe' });

const result = exec('npm', [
  'show',
  '@infinite-table/infinite-react',
  'versions',
  '--json',
]);

let versions = JSON.parse(result.stdout);

const allowCanaries =
  process.env.NEXT_PUBLIC_INFINITE_ALLOW_CANARY_IN_DOCS === 'true' ||
  process.env.NEXT_PUBLIC_INFINITE_ALLOW_CANARY_IN_DOCS === true;

versions = allowCanaries
  ? versions
  : versions.filter((v) => !v.includes('canary'));

// TODO AFL: retrieve latest canary for NEXT, latest stable for master, NEXT_PUBLIC_INFINITE_REACT_VERSION for everything else.
const NEXT_PUBLIC_INFINITE_REACT_VERSION =
  process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION || versions.pop();

// Local docs-kit development: DOCS_KIT_LOCAL=1 (kit checked out next to this
// repo) or DOCS_KIT_LOCAL=/path/to/docs-kit resolves @thedatagrid/docs-kit to
// the kit's TypeScript source - no `npm link`, no kit build.
const docsKitLocal = resolveDocsKitLocal();

let nextConfig = withMDX({
  typescript: {
    tsconfigPath: docsKitLocal
      ? docsKitLocal.tsconfigPath
      : 'tsconfig.next.json',
  },
  ...(docsKitLocal ? { turbopack: { root: docsKitLocal.root } } : null),
  env: {
    NEXT_PUBLIC_INFINITE_REACT_VERSION,
    // NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // pageExtensions: ['page.tsx', 'page.mdx', 'page.md'],
  // rewrites() {
  //   return [
  //     {
  //       source: '/feed.xml',
  //       destination: '/_next/static/feed.xml',
  //     },
  //   ];
  // },
  images: {
    unoptimized: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: 'export',
  // exportTrailingSlash: true,
  experimental: {
    externalDir: true,
    // mdxRs: true,
  },
  // transpilePackages: ['@infinite-table/infinite-react'],
});

// the redirects are added by the contentlayer plugin
// as a way to force building the pages, but we don't want that
// as we call the contentlayer CLI ourselves
delete nextConfig.redirects;

module.exports = nextConfig;

function resolveDocsKitLocal() {
  const local = process.env.DOCS_KIT_LOCAL;
  if (!local || local === '0' || local === 'false') {
    return null;
  }
  const fs = require('fs');
  const kitDir =
    local === '1' || local === 'true'
      ? path.resolve(__dirname, '../../docs-kit')
      : path.resolve(local);
  const kitSrc = path.join(kitDir, 'packages/docs-kit/src');
  if (!fs.existsSync(kitSrc)) {
    throw new Error(`DOCS_KIT_LOCAL: no docs-kit source at ${kitSrc}`);
  }
  const nextTsconfig = path.join(__dirname, 'tsconfig.next.json');
  const base = require('typescript').parseConfigFileTextToJson(
    nextTsconfig,
    fs.readFileSync(nextTsconfig, 'utf8'),
  ).config;
  const rel = (file) => path.relative(__dirname, file);
  const subpaths = {
    code: 'code/index.ts',
    remark: 'remark/index.ts',
    demos: 'demos/index.ts',
    'demos/client': 'demos/client.ts',
    react: 'react/index.ts',
    'react/styles.css': 'react/styles.css',
    fork: 'fork/index.ts',
    frameworks: 'frameworks/index.ts',
    'frameworks/react': 'frameworks/react/index.ts',
    'frameworks/styles.css': 'frameworks/styles.css',
  };
  const paths = { ...base.compilerOptions.paths };
  for (const [subpath, file] of Object.entries(subpaths)) {
    paths[`@thedatagrid/docs-kit/${subpath}`] = [rel(path.join(kitSrc, file))];
  }
  const genDir = path.join(__dirname, 'src/.gen');
  fs.mkdirSync(genDir, { recursive: true });
  const tsconfigPath = 'src/.gen/tsconfig.docs-kit-local.json';
  fs.writeFileSync(
    path.join(__dirname, tsconfigPath),
    JSON.stringify(
      {
        extends: '../../tsconfig.next.json',
        compilerOptions: { baseUrl: '../..', paths },
      },
      null,
      2,
    ),
  );
  // Turbopack only reads files inside its root
  let root = path.resolve(__dirname, '..');
  while (!kitDir.startsWith(root + path.sep)) {
    root = path.dirname(root);
  }
  console.log(`[docs-kit] using local source from ${kitSrc}`);
  return { tsconfigPath, root };
}
