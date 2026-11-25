// The Angular docs: the same pages as /docs/..., for the pages that have an
// Angular version (`angular:` in the page's frontmatter).
import type { Metadata } from 'next';

import {
  docsPageMetadata,
  docsStaticParams,
  DocsRoutePage,
} from '@www/components/DocsRoutePage';

type Params = { params: Promise<{ docsPages: string[] }> };

export function generateStaticParams() {
  return docsStaticParams('angular');
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return docsPageMetadata('angular', (await params).docsPages);
}

export default async function AngularDocsPage({ params }: Params) {
  return <DocsRoutePage framework="angular" slug={(await params).docsPages} />;
}
