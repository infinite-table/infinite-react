// The docs-kit CLI (`node scripts/docs-kit.mjs demos build|--watch`), from the
// installed package or, with DOCS_KIT_LOCAL, the kit's source.
import { importDocsKit } from './docs-kit-import.mjs';

await importDocsKit('demos/cli');
