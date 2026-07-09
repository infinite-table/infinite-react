import type { IndexEntry, TestPagesIndexProps } from './TestPagesIndex.types';

export type { IndexEntry, TestPagesIndexProps };

// Next.js index pages list .page.tsx siblings; the Vue dev server uses the
// shared JS helper directly with `.page.vue` via the Vite plugin middleware.
const {
  buildTestPagesIndexProps: build,
} = require('../../scripts/buildTestPagesIndexProps.js') as {
  buildTestPagesIndexProps: (
    pathOrFilename: string,
    options?: { pageSuffix?: string },
  ) => TestPagesIndexProps;
};

/**
 * Server-only helper that reads a folder under `<cwd>/src/pages` and returns
 * the props for {@link TestPagesIndex}. The `pathOrFilename` argument is
 * normally the page's `__filename`, from which this helper infers which folder
 * under `src/pages/` to list.
 */
export const buildTestPagesIndexProps = (
  pathOrFilename: string,
): TestPagesIndexProps =>
  build(pathOrFilename, { pageSuffix: '.page.tsx' });
