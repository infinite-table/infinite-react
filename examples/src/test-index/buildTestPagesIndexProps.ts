import * as fs from 'fs';
import * as path from 'path';

import type { IndexEntry, TestPagesIndexProps } from './TestPagesIndex';

const PAGE_SUFFIX = '.page.tsx';

const isListableFolder = (name: string) =>
  !name.startsWith('.') &&
  !name.startsWith('_') &&
  name !== 'node_modules' &&
  !name.endsWith('-snapshots');

const buildHref = (segments: string[], extra?: string) => {
  const parts = extra ? [...segments, extra] : segments;
  if (parts.length === 0) {
    return '/';
  }
  return `/${parts.join('/')}`;
};

const buildParentHref = (segments: string[]): string | null => {
  if (segments.length === 0) {
    return null;
  }
  return buildHref(segments.slice(0, -1));
};

const buildSubtreeEntries = (
  dir: string,
  routeSegments: string[],
  pathPrefix: string,
  depth: number,
): IndexEntry[] => {
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
  const result: IndexEntry[] = [];

  const folders = dirEntries
    .filter((entry) => entry.isDirectory() && isListableFolder(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  const pages = dirEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(PAGE_SUFFIX) &&
        entry.name !== `index${PAGE_SUFFIX}` &&
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
      ),
    );
  }

  for (const page of pages) {
    const baseName = page.name.slice(0, -PAGE_SUFFIX.length);
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

/**
 * Derive the route-relative path of a test pages index from any of:
 *   - a Next.js compiled `__filename`, e.g. `<cwd>/.next/server/pages/foo/bar.js`
 *   - a source `__filename`, e.g. `<cwd>/src/pages/foo/bar/index.page.tsx`
 *   - an already-relative string like `"foo/bar"` or `""` for the root
 */
const inferRelativePath = (input: string): string => {
  if (!input) {
    return '';
  }
  const normalized = input.replace(/\\/g, '/');
  const PAGES_MARKER = '/pages/';
  const idx = normalized.lastIndexOf(PAGES_MARKER);

  let route =
    idx === -1 ? normalized : normalized.slice(idx + PAGES_MARKER.length);
  // strip file extension if any (.js / .tsx / .ts / .page.tsx ...)
  route = route.replace(/\.[^./]+$/, '');
  route = route.replace(/\.page$/, '');
  // collapse trailing /index (and the bare "index" root case)
  route = route.replace(/(?:^|\/)index$/, '');
  // trim slashes
  return route.replace(/^\/+|\/+$/g, '');
};

/**
 * Server-only helper that reads a folder under `<cwd>/src/pages` and returns
 * the props for {@link TestPagesIndex}. The `pathOrFilename` argument is
 * normally the page's `__filename`, from which this helper infers which folder
 * under `src/pages/` to list — so callers don't need to hardcode their own
 * path.
 *
 * Lists the full subtree under the current folder so nested test pages are
 * visible and filterable without drilling into each subfolder.
 *
 * This file is intentionally separate from the React component so Next.js can
 * keep it out of the client bundle: only reference it from `getStaticProps`.
 */
export const buildTestPagesIndexProps = (
  pathOrFilename: string,
): TestPagesIndexProps => {
  const relativePath = inferRelativePath(pathOrFilename);
  const segments = relativePath.split('/').filter(Boolean);
  const dir = path.join(process.cwd(), 'src', 'pages', ...segments);

  return {
    segments,
    parentHref: buildParentHref(segments),
    entries: buildSubtreeEntries(dir, segments, '', 0),
  };
};
