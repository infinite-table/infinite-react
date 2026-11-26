// Shared filesystem helper for test page index listings (React + Vue dev).
const fs = require('fs');
const path = require('path');

const DEFAULT_PAGE_SUFFIX = '.page.tsx';
const INDEX_BASENAME = 'index';

const isListableFolder = (name) =>
  !name.startsWith('.') &&
  !name.startsWith('_') &&
  name !== 'node_modules' &&
  !name.endsWith('-snapshots');

const buildHref = (segments, extra) => {
  const parts = extra ? [...segments, extra] : segments;
  if (parts.length === 0) {
    return '/';
  }
  return `/${parts.join('/')}`;
};

const buildParentHref = (segments) => {
  if (segments.length === 0) {
    return null;
  }
  return buildHref(segments.slice(0, -1));
};

/**
 * The folders and pages under `dir`, as a tree: folders first, then pages,
 * each by name. Folders without a page in them (at any depth) are left out,
 * so the Vue and Angular indexes don't list folders only React has pages in.
 */
const buildTree = (dir, routeSegments, pageSuffix, includePage) => {
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true });

  const folders = dirEntries
    .filter((entry) => entry.isDirectory() && isListableFolder(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((folder) => {
      const childRouteSegments = [...routeSegments, folder.name];
      return {
        type: 'folder',
        name: folder.name,
        href: buildHref(childRouteSegments),
        children: buildTree(
          path.join(dir, folder.name),
          childRouteSegments,
          pageSuffix,
          includePage,
        ),
      };
    })
    .filter((folder) => folder.children.length > 0);

  const pages = dirEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(pageSuffix) &&
        entry.name !== `${INDEX_BASENAME}${pageSuffix}` &&
        !entry.name.startsWith('_'),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((page) => {
      const baseName = page.name.slice(0, -pageSuffix.length);
      return {
        type: 'page',
        name: baseName,
        href: buildHref(routeSegments, baseName),
      };
    })
    .filter((page) => !includePage || includePage(page.href.slice(1)));

  return [...folders, ...pages];
};

const inferRelativePath = (input) => {
  if (!input) {
    return '';
  }
  const normalized = input.replace(/\\/g, '/');
  const PAGES_MARKER = '/pages/';
  const idx = normalized.lastIndexOf(PAGES_MARKER);

  let route =
    idx === -1 ? normalized : normalized.slice(idx + PAGES_MARKER.length);
  route = route.replace(/\.[^./]+$/, '');
  route = route.replace(/\.page$/, '');
  route = route.replace(/(?:^|\/)index$/, '');
  return route.replace(/^\/+|\/+$/g, '');
};

/**
 * @param {string} pathOrFilename route-relative path or page __filename
 * @param {{
 *   pageSuffix?: string,
 *   pagesRoot?: string,
 *   includePage?: (pagePath: string) => boolean,
 * }} [options] `includePage` gets the page's path under src/pages, without
 *   the suffix (`tests/a/b`)
 */
const buildTestPagesIndexProps = (pathOrFilename, options = {}) => {
  const pageSuffix = options.pageSuffix || DEFAULT_PAGE_SUFFIX;
  const pagesRoot =
    options.pagesRoot || path.join(process.cwd(), 'src', 'pages');

  const relativePath = inferRelativePath(pathOrFilename);
  const segments = relativePath.split('/').filter(Boolean);
  const dir = path.join(pagesRoot, ...segments);

  return {
    segments,
    parentHref: buildParentHref(segments),
    entries: buildTree(dir, segments, pageSuffix, options.includePage),
  };
};

/**
 * Route paths that have an index.page.tsx sibling (same URLs as Next.js).
 * @param {string} [pagesRoot]
 */
const collectTestIndexRoutePaths = (pagesRoot) => {
  const root = pagesRoot || path.join(process.cwd(), 'src', 'pages');
  const routes = [];

  const walk = (dir, segments) => {
    const indexFile = path.join(dir, `${INDEX_BASENAME}.page.tsx`);
    if (fs.existsSync(indexFile)) {
      routes.push(buildHref(segments));
    }

    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory() && isListableFolder(entry.name)) {
        walk(path.join(dir, entry.name), [...segments, entry.name]);
      }
    }
  };

  walk(root, []);
  return routes.sort((a, b) => a.localeCompare(b));
};

module.exports = {
  buildTestPagesIndexProps,
  collectTestIndexRoutePaths,
  inferRelativePath,
};
