// Prebuilt, editable docs demos: `npm run build-demos` / `npm run watch-demos`.
// Every `content/**/*.demo.tsx` becomes an iframe page under public/gen/demos;
// `@infinite-table/infinite-react` is built from ../source/src into the shared
// import map, so the docs always show the current source.
//
// A sibling `x.demo.vue` is the Vue version of `x.demo.tsx`: those are built
// into public/gen/demos/_vue, against `@infinite-table/infinite-vue` (the Vue
// entry of the same source tree).
import fs from 'node:fs';
import path from 'node:path';

import nextEnv from '@next/env';

import { frameworkResolvePlugin } from '../source/framework-resolve-plugin.ts';
import { vanillaConfig } from '../source/tsup-vanilla-extract-config.ts';
import { DOCS_FENCE_DEFAULTS } from './src/utils/docsKit.ts';
import { pageSourceHasFramework } from './src/utils/docsFrameworkPages.ts';

// the docs-kit CLI isn't Next, so it doesn't read .env* (the license key lives in .env.local)
nextEnv.loadEnvConfig(
  import.meta.dirname,
  process.env.NODE_ENV !== 'production',
);

const sourcePackage = JSON.parse(
  fs.readFileSync(new URL('../source/package.json', import.meta.url), 'utf8'),
);

// keep in sync with src/utils/docsKit.ts
const DEMO_ANCHOR_PREFIX = 'demo-';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://data.infinite-table.com';

// Same fallback as Sandpack's examples: the published version the docs build
// is pinned to (next.config.js), else the version in source/package.json.
const INFINITE_VERSION =
  process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION || sourcePackage.version;

const SOURCE_DIR = path.resolve(import.meta.dirname, '../source/src');

const FORK_STYLES = `.Infinite {
  flex: 1;
}

body {
  background: rgb(35, 39, 47);
}`;

const forkPrelude = (packageName) =>
  [
    `import '${packageName}/index.css';`,
    "document.documentElement.classList.add('infinite-theme-mode--dark');",
  ].join('\n');

/** @type {import('@thedatagrid/docs-kit/demos').DocsKitConfig} */
export default {
  contentDir: 'content',
  outDir: 'public/gen/demos',
  urlRoot: '/gen/demos',
  // card anchors are #demo-<title>, so they never clash with heading ids
  anchorPrefix: DEMO_ANCHOR_PREFIX,
  fenceDefaults: DOCS_FENCE_DEFAULTS,
  libraries: {
    '@infinite-table/infinite-react': {
      entry: '../source/src/index.tsx',
      plugins: () => [frameworkResolvePlugin('react'), vanillaConfig],
      watch: [SOURCE_DIR],
    },
  },
  // the library CSS comes from the vanilla-extract build above
  stubImports: [/^@infinite-table\/infinite-react\/.+\.css$/],
  define: {
    'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(BASE_URL),
    __DEV__: 'false',
    __VERSION__: JSON.stringify(sourcePackage.version),
    __VERSION_TIMESTAMP__: JSON.stringify(sourcePackage.publishedAt || 0),
  },
  bootstrapDefine: {
    'process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY || '',
    ),
  },
  // shown, edited and forked code gets the URL inlined (as the Sandpack examples do)
  sourceReplacements: {
    'process.env.NEXT_PUBLIC_BASE_URL': `'${BASE_URL}'`,
  },
  bootstrap: 'docs-kit.bootstrap.ts',
  defaultTheme: 'dark',
  themeClasses: {
    dark: ['infinite-theme-mode--dark'],
    light: ['infinite-theme-mode--light'],
  },
  pageStyle: `
    body { background: var(--infinite-background); color: var(--infinite-cell-color); }
    #root > .Infinite, .Infinite { flex: 1; }
  `,
  fork: {
    dependencies: { '@infinite-table/infinite-react': INFINITE_VERSION },
    entryPrelude: forkPrelude('@infinite-table/infinite-react'),
    styles: FORK_STYLES,
  },
  frameworks: {
    vue: {
      libraries: {
        '@infinite-table/infinite-vue': {
          entry: '../source/src/index.vue.tsx',
          plugins: () => [frameworkResolvePlugin('vue'), vanillaConfig],
          watch: [SOURCE_DIR],
        },
      },
      stubImports: [/^@infinite-table\/infinite-vue\/.+\.css$/],
      // a Vue demo opened on its own links back to the Vue page, when there is one
      routeForPage: (pagePath) => {
        const pageFile = path.join(
          import.meta.dirname,
          'content',
          `${pagePath}.page.md`,
        );
        const source = fs.existsSync(pageFile)
          ? fs.readFileSync(pageFile, 'utf8')
          : null;
        return pageSourceHasFramework(source, 'vue')
          ? `/vue/${pagePath}`.replace(/\/index$/, '')
          : null;
      },
      // the React and Vue packages are versioned and published together
      fork: {
        dependencies: { '@infinite-table/infinite-vue': INFINITE_VERSION },
        entryPrelude: forkPrelude('@infinite-table/infinite-vue'),
        styles: FORK_STYLES,
      },
    },
  },
};
