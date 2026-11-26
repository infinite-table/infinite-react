import { docsPageMetadata, DocsRoutePage } from '@www/components/DocsRoutePage';

export const metadata = docsPageMetadata('angular', []);

export default function AngularDocs() {
  return <DocsRoutePage framework="angular" slug={[]} />;
}
