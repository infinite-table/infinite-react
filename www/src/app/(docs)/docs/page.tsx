import { docsPageMetadata, DocsRoutePage } from '@www/components/DocsRoutePage';

export const metadata = docsPageMetadata('react', []);

export default function Docs() {
  return <DocsRoutePage framework="react" slug={[]} />;
}
