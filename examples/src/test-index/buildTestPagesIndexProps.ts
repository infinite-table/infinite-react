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
 * This file is intentionally separate from the React component so Next.js can
 * keep it out of the client bundle: only reference it from `getStaticProps`.
 */
export const buildTestPagesIndexProps = (
  pathOrFilename: string,
): TestPagesIndexProps => {
  const relativePath = inferRelativePath(pathOrFilename);
  const segments = relativePath.split('/').filter(Boolean);
  const dir = path.join(process.cwd(), 'src', 'pages', ...segments);
  const dirEntries = fs.readdirSync(dir, { withFileTypes: true });

  const folders: IndexEntry[] = dirEntries
    .filter((entry) => entry.isDirectory() && isListableFolder(entry.name))
    .map((entry) => ({
      type: 'folder' as const,
      name: entry.name,
      href: buildHref(segments, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const pages: IndexEntry[] = dirEntries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(PAGE_SUFFIX) &&
        entry.name !== `index${PAGE_SUFFIX}` &&
        // ignore the next.js _app / _document files
        !entry.name.startsWith('_'),
    )
    .map((entry) => {
      const baseName = entry.name.slice(0, -PAGE_SUFFIX.length);
      return {
        type: 'page' as const,
        name: baseName,
        href: buildHref(segments, baseName),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    segments,
    parentHref: buildParentHref(segments),
    entries: [...folders, ...pages],
  };
};
