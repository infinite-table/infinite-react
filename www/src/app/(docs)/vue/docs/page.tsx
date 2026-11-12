import { docsPageMetadata, DocsRoutePage } from '@www/components/DocsRoutePage';

export const metadata = docsPageMetadata('vue', []);

export default function VueDocs() {
  return <DocsRoutePage framework="vue" slug={[]} />;
}
