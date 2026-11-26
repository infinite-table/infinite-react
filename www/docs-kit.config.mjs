// Prebuilt, editable docs demos: `npm run build-demos` / `npm run watch-demos`.
// Every `content/**/*.demo.tsx` becomes an iframe page under public/gen/demos;
// `@infinite-table/infinite-react` is built from ../source/src into the shared
// import map, so the docs always show the current source.
//
// A sibling `x.demo.vue` is the Vue version of `x.demo.tsx`: those are built
// into public/gen/demos/_vue, against `@infinite-table/infinite-vue` (the Vue
// entry of the same source tree). A sibling `x.demo.angular.ts` is the Angular
// version, built into public/gen/demos/_angular against
// `@infinite-table/infinite-angular`: the Angular compiler's partial emit of
// the same source (../source/.angular-out, `pnpm -C ../source run
// ngc:angular`), which the demo iframes link at runtime (JIT).
//
// The frameworks, their packages, demo suffixes and folders come from
// www/frameworks.json; what only this build knows about a framework (its
// library entry, its bootstrap) is in FRAMEWORK_BUILDS below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import nextEnv from '@next/env';

import { angularCssFromSourcePlugin } from '../source/angular-css-from-source-plugin.ts';
import { frameworkResolvePlugin } from '../source/framework-resolve-plugin.ts';
import { vanillaConfig } from '../source/tsup-vanilla-extract-config.ts';
import { importDocsKit } from './scripts/docs-kit-import.mjs';
import { DOCS_FENCE_DEFAULTS } from './src/utils/docsKit.ts';
import { pageSourceHasFramework } from './src/utils/docsFrameworkPages.ts';
import {
  DOCS_DEFAULT_FRAMEWORK,
  DOCS_FRAMEWORK_IDS,
  docsFramework,
} from './src/utils/docsFrameworksRegistry.ts';

// the docs-kit CLI isn't Next, so it doesn't read .env* (the license key lives in .env.local)
nextEnv.loadEnvConfig(
  import.meta.dirname,
  process.env.NODE_ENV !== 'production',
);

const sourcePackage = JSON.parse(
  fs.readFileSync(new URL('../source/package.json', import.meta.url), 'utf8'),
);

// the themes the package ships as theme/<name>.css (source/src/generate-theme-<name>.ts)
const THEMES = fs
  .readdirSync(new URL('../source/src', import.meta.url))
  .map((file) => /^generate-theme-(.+)\.ts$/.exec(file)?.[1])
  .filter(Boolean);

// The Tailwind setup of `*-tailwind.demo.tsx` demos: docs-kit.bootstrap.ts in
// the docs, and the fork variant below in a forked sandbox.
const TAILWIND_STYLE = fs.readFileSync(
  new URL('./docs-kit.tailwind.css', import.meta.url),
  'utf8',
);
// keep in sync with docs-kit.bootstrap.ts
const TAILWIND_LAYER_ORDER =
  '@layer theme, base, infinite-table, components, utilities;';
const TAILWIND_BROWSER_VERSION = JSON.parse(
  fs.readFileSync(
    new URL('./node_modules/@tailwindcss/browser/package.json', import.meta.url),
    'utf8',
  ),
).version;

// keep in sync with src/utils/docsKit.ts
const DEMO_ANCHOR_PREFIX = 'demo-';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://data.infinite-table.com';

// Forked demos use the published version the docs build
// is pinned to (next.config.js), else the version in source/package.json.
const INFINITE_VERSION =
  process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION || sourcePackage.version;

const SOURCE_DIR = path.resolve(import.meta.dirname, '../source/src');
// the Angular compiler's emit of SOURCE_DIR (source/tsconfig.angular.json)
const ANGULAR_OUT_DIR = path.resolve(
  import.meta.dirname,
  '../source/.angular-out',
);

// the framework-neutral part of the kit's showcase toolkit (the cursor, sleep,
// waitFor, fling…), for the Vue and Angular heroes
const SHOWCASE_SCRIPTED = path.join(
  path.dirname(
    fileURLToPath(import.meta.resolve('@thedatagrid/docs-kit/showcase')),
  ),
  'scripted.js',
);

// What the home page heroes of the frameworks that aren't in the site's
// bundle need (content/home/vue-hero.demo.vue, angular-hero.demo.angular.ts):
const HERO_LIBRARIES = {
  // - the tick worker is an entry of the import map, so the demo starts it
  //   with `new Worker(import.meta.resolve('hero-tick-worker'))`
  'hero-tick-worker': {
    entry: 'src/components/hero/data/tick.worker.ts',
  },
  // - the scripted cursor is the kit's own, without its React components
  //   (the package entry exports those too)
  '@thedatagrid/docs-kit/showcase': {
    entry: SHOWCASE_SCRIPTED,
  },
};

const FORK_STYLES = `.Infinite {
  flex: 1;
}

body {
  background: rgb(35, 39, 47);
}`;

const FORK_DARK_MODE =
  "document.documentElement.classList.add('infinite-theme-mode--dark');";

const forkPrelude = (packageName) =>
  [`import '${packageName}/index.css';`, FORK_DARK_MODE].join('\n');

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * What the demo build of each framework of www/frameworks.json needs beyond
 * the registry: the library entry in ../source (with its esbuild plugins and
 * the folders to watch, when they're not the source's), and the settings
 * only that framework has.
 */
const FRAMEWORK_BUILDS = {
  react: {
    entry: '../source/src/index.tsx',
    bootstrap: 'docs-kit.bootstrap.ts',
    fork: {
      variants: [
        {
          // `*-tailwind.demo.tsx`: the same Tailwind setup as in the docs
          // (docs-kit.bootstrap.ts), in the forked sandbox's page
          match: '-tailwind\\.demo\\.tsx$',
          indexHtmlHead: [
            `<style>${TAILWIND_LAYER_ORDER}</style>`,
            `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@${TAILWIND_BROWSER_VERSION}"></script>`,
            `<style type="text/tailwindcss">\n${TAILWIND_STYLE}</style>`,
          ].join('\n'),
        },
      ],
    },
  },
  vue: {
    entry: '../source/src/index.vue.tsx',
    libraries: HERO_LIBRARIES,
    // sets the global license key - the Vue build starts without the React bootstrap
    bootstrap: 'docs-kit.bootstrap.vue.ts',
  },
  angular: {
    // not the TypeScript source: Angular components are compiled by ngc
    // first (`www dev` keeps it running in watch mode)
    entry: '../source/.angular-out/index.angular.js',
    plugins: () => [
      // the class names of the React and Vue builds
      angularCssFromSourcePlugin(
        path.resolve(import.meta.dirname, '../source'),
      ),
      frameworkResolvePlugin('angular'),
      vanillaConfig,
    ],
    watch: [ANGULAR_OUT_DIR],
    libraries: HERO_LIBRARIES,
    // the license key, as `provideInfiniteTable({ licenseKey })`
    bootstrap: 'docs-kit.bootstrap.angular.ts',
    // no pageStyle of its own: the `.Infinite { flex: 1 }` of the
    // top-level one works, since <infinite-table> is the grid's root
    // element (`.Infinite`) and the hosts above it (the demo's, the
    // DataSource's) are `display: contents` (`#root > .Infinite` doesn't
    // match)
    fork: {
      // an Angular CLI project lists its global CSS in angular.json; it
      // can't be imported from TypeScript
      globalStyles: [`${docsFramework('angular').package}/index.css`],
      entryPrelude: FORK_DARK_MODE,
    },
  },
};

// docs-kit decides where a framework's demos fork to: the registry says the same
const { FORK_TARGETS } = await importDocsKit('fork');
for (const id of DOCS_FRAMEWORK_IDS) {
  if (!FRAMEWORK_BUILDS[id]) {
    throw new Error(`docs-kit.config.mjs: no FRAMEWORK_BUILDS entry for "${id}"`);
  }
  if (FORK_TARGETS[id]?.id !== docsFramework(id).fork) {
    throw new Error(
      `www/frameworks.json: "${id}" forks to ${FORK_TARGETS[id]?.id ?? 'nowhere'} in docs-kit, not ${docsFramework(id).fork}`,
    );
  }
}

/**
 * The part of the docs-kit config that is per framework: the library (from
 * source) and its themes, the demo suffix, the stubbed CSS import, the fork
 * dependencies. Top level for React, under `frameworks` for the others.
 */
function frameworkBuild(id) {
  const { package: packageName, demoSuffix, prefix } = docsFramework(id);
  const build = FRAMEWORK_BUILDS[id];
  return {
    demoSuffix,
    libraries: {
      [packageName]: {
        entry: build.entry,
        plugins:
          build.plugins ?? (() => [frameworkResolvePlugin(id), vanillaConfig]),
        watch: build.watch ?? [SOURCE_DIR],
      },
      // `import '@infinite-table/infinite-react/theme/<name>.css'` in a demo:
      // the themes are built from source as well. Their CSS is linked in every
      // demo, which is fine: a theme only applies under its
      // `infinite-theme-name--<name>` class. Every package ships the same
      // theme/<name>.css.
      ...Object.fromEntries(
        THEMES.map((theme) => [
          `${packageName}/theme/${theme}.css`,
          { entry: `../source/src/generate-theme-${theme}.ts` },
        ]),
      ),
      ...build.libraries,
    },
    // the library CSS comes from the vanilla-extract build above
    stubImports: [new RegExp(`^${escapeRegExp(packageName)}/index\\.css$`)],
    bootstrap: build.bootstrap,
    // a Vue demo opened on its own links back to the Vue page, when there is
    // one (React: the default, the page next to the demo)
    ...(id === DOCS_DEFAULT_FRAMEWORK
      ? null
      : {
          routeForPage: (pagePath) => {
            const pageFile = path.join(
              import.meta.dirname,
              'content',
              `${pagePath}.page.md`,
            );
            const source = fs.existsSync(pageFile)
              ? fs.readFileSync(pageFile, 'utf8')
              : null;
            return pageSourceHasFramework(source, id)
              ? `${prefix}/${pagePath}`.replace(/\/index$/, '')
              : null;
          },
        }),
    // the packages are versioned and published together
    fork: {
      dependencies: { [packageName]: INFINITE_VERSION },
      entryPrelude: forkPrelude(packageName),
      styles: FORK_STYLES,
      ...build.fork,
    },
  };
}

const DEMO_OUT_DIR = docsFramework(DOCS_DEFAULT_FRAMEWORK).demoOutDir;

const { demoSuffix, libraries, stubImports, bootstrap, fork } =
  frameworkBuild(DOCS_DEFAULT_FRAMEWORK);

/** @type {import('@thedatagrid/docs-kit/demos').DocsKitConfig} */
export default {
  contentDir: 'content',
  // the other frameworks build into <outDir>/_<id> (public/gen/demos/_vue)
  outDir: DEMO_OUT_DIR,
  urlRoot: DEMO_OUT_DIR.replace(/^public/, ''),
  // card anchors are #demo-<title>, so they never clash with heading ids
  anchorPrefix: DEMO_ANCHOR_PREFIX,
  fenceDefaults: DOCS_FENCE_DEFAULTS,
  framework: DOCS_DEFAULT_FRAMEWORK,
  demoSuffix,
  libraries,
  stubImports,
  define: {
    'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(BASE_URL),
    __DEV__: 'false',
    __VERSION__: JSON.stringify(sourcePackage.version),
    // as if the source was published now (like the source build does) -
    // so licenses that ended before today are expired
    __VERSION_TIMESTAMP__: JSON.stringify(Date.now()),
  },
  bootstrapDefine: {
    // the Tailwind setup of `*-tailwind.demo.tsx` demos
    'process.env.DOCS_TAILWIND_STYLE': JSON.stringify(TAILWIND_STYLE),
    'process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY || '',
    ),
  },
  // shown, edited and forked code gets the URL inlined
  sourceReplacements: {
    'process.env.NEXT_PUBLIC_BASE_URL': `'${BASE_URL}'`,
  },
  bootstrap,
  defaultTheme: 'dark',
  themeClasses: {
    dark: ['infinite-theme-mode--dark'],
    light: ['infinite-theme-mode--light'],
  },
  pageStyle: `
    body { background: var(--infinite-background); color: var(--infinite-cell-color); }
    #root > .Infinite, .Infinite { flex: 1; }
  `,
  fork,
  frameworks: Object.fromEntries(
    DOCS_FRAMEWORK_IDS.filter((id) => id !== DOCS_DEFAULT_FRAMEWORK).map(
      (id) => [id, frameworkBuild(id)],
    ),
  ),
};
