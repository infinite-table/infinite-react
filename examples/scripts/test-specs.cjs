// Which Playwright specs run on which project (react, vue, angular).
//
// Read by playwright.config.ts (testIgnore of the vue and angular projects)
// and scripts/parity.mjs.
const fs = require('node:fs');
const path = require('node:path');

const PAGES_DIR = path.resolve(__dirname, '..', 'src', 'pages');

/** the page sibling of a spec, per Playwright project */
const PAGE_EXTENSIONS = {
  react: '.page.tsx',
  vue: '.page.vue',
  angular: '.page.angular.ts',
};

/**
 * Specs that test React-only internals and import `test` from
 * @playwright/test directly (bypassing the fixture that skips specs without
 * a page sibling):
 * - lists: the RawList/VirtualList React component wrappers (the Vue
 *   siblings ListRowPoolForVue/RawTableForVue are covered by jest bridge
 *   specs)
 * - hooks: the React useComponentState/useProperty hook pages
 */
const REACT_ONLY_GLOBS = ['**/tests/lists/**', '**/tests/hooks/**'];

/** spec files under src/pages, relative to it (`tests/a/b.spec.ts`) */
function listSpecs(dir = PAGES_DIR, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listSpecs(full, out);
    else if (entry.name.endsWith('.spec.ts')) {
      out.push(path.relative(PAGES_DIR, full).split(path.sep).join('/'));
    }
  }
  return out.sort();
}

/** `tests/a/b.spec.ts` -> the absolute path of `tests/a/b.page.tsx` etc */
function pageFileOf(spec, project) {
  return path.join(
    PAGES_DIR,
    spec.replace(/\.spec\.ts$/, PAGE_EXTENSIONS[project]),
  );
}

/** whether `file` is a generated test index listing (generate-index-pages.js) */
function isIndexListing(file) {
  return (
    path.basename(file) === 'index.page.tsx' &&
    fs.readFileSync(file, 'utf8').includes('TestPagesIndex')
  );
}

/**
 * Node-side unit specs: no test page of their own (no `.page.tsx` sibling,
 * or only a test index listing next to an `index.spec.ts`). They don't
 * depend on the framework, so they run on the react project only.
 */
function pagelessSpecs(specs = listSpecs()) {
  return specs.filter((spec) => {
    const reactPage = pageFileOf(spec, 'react');
    return !fs.existsSync(reactPage) || isIndexListing(reactPage);
  });
}

/** a RegExp for `testIgnore` that matches the given specs (relative to src/pages) */
function specsRegExp(specs) {
  if (!specs.length) return /$^/;
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `[\\\\/]src[\\\\/]pages[\\\\/](${specs
      .map((spec) => escape(spec).replace(/\//g, '[\\\\/]'))
      .join('|')})$`,
  );
}

module.exports = {
  PAGES_DIR,
  PAGE_EXTENSIONS,
  REACT_ONLY_GLOBS,
  listSpecs,
  pageFileOf,
  pagelessSpecs,
  specsRegExp,
};
