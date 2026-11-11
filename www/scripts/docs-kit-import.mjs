// Imports a @thedatagrid/docs-kit subpath: from the installed package, or,
// with DOCS_KIT_LOCAL=1 (kit checked out next to this repo) or
// DOCS_KIT_LOCAL=/path/to/docs-kit, from the kit's TypeScript source
// (Node >= 22.18 runs it directly). next.config.js does the same for Next.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_FILES = {
  code: 'code/index.ts',
  remark: 'remark/index.ts',
  demos: 'demos/index.ts',
  'demos/cli': 'demos/cli.ts',
  fork: 'fork/index.ts',
};

export function docsKitLocalDir() {
  const local = process.env.DOCS_KIT_LOCAL;
  if (!local || local === '0' || local === 'false') return null;
  return local === '1' || local === 'true'
    ? path.resolve(import.meta.dirname, '../../../docs-kit')
    : path.resolve(local);
}

export async function importDocsKit(subpath) {
  const kitDir = docsKitLocalDir();
  if (!kitDir) return import(`@thedatagrid/docs-kit/${subpath}`);
  const file = path.join(kitDir, 'packages/docs-kit/src', SOURCE_FILES[subpath]);
  return import(pathToFileURL(file).href);
}
