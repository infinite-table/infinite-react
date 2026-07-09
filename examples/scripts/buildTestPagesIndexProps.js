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

const buildSubtreeEntries = (
  dir,
  routeSegments,
  pathPrefix,
  depth,
  pageSuffix,
) => {
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  const folders = dirEntries
    .filter((entry) => entry.isDirectory() && isListableFolder(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const pages = dirEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(pageSuffix) &&
        entry.name !== `${INDEX_BASENAME}${pageSuffix}` &&
        !entry.name.startsWith('_'),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const folder of folders) {
    const childRouteSegments = [...routeSegments, folder.name];
    const entryPath = pathPrefix
      ? `${pathPrefix}/${folder.name}`
      : folder.name;

    result.push({
      type: 'folder',
      name: folder.name,
      path: entryPath,
      href: buildHref(childRouteSegments),
      depth,
    });

    result.push(
      ...buildSubtreeEntries(
        path.join(dir, folder.name),
        childRouteSegments,
        entryPath,
        depth + 1,
        pageSuffix,
      ),
    );
  }

  for (const page of pages) {
    const baseName = page.name.slice(0, -pageSuffix.length);
    const entryPath = pathPrefix ? `${pathPrefix}/${baseName}` : baseName;

    result.push({
      type: 'page',
      name: baseName,
      path: entryPath,
      href: buildHref(routeSegments, baseName),
      depth,
    });
  }

  return result;
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
 * @param {{ pageSuffix?: string, pagesRoot?: string }} [options]
 */
const buildTestPagesIndexProps = (pathOrFilename, options = {}) => {
  const pageSuffix = options.pageSuffix || DEFAULT_PAGE_SUFFIX;
  const pagesRoot =
    options.pagesRoot ||
    path.join(process.cwd(), 'src', 'pages');

  const relativePath = inferRelativePath(pathOrFilename);
  const segments = relativePath.split('/').filter(Boolean);
  const dir = path.join(pagesRoot, ...segments);

  return {
    segments,
    parentHref: buildParentHref(segments),
    entries: buildSubtreeEntries(dir, segments, '', 0, pageSuffix),
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
