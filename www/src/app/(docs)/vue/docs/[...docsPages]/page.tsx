// The Vue docs: the same pages as /docs/..., for the pages that have a Vue
// version (`vue:` in the page's frontmatter).
import type { Metadata } from 'next';

import {
  docsPageMetadata,
  docsStaticParams,
  DocsRoutePage,
} from '@www/components/DocsRoutePage';

type Params = { params: Promise<{ docsPages: string[] }> };

export function generateStaticParams() {
  return docsStaticParams('vue');
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return docsPageMetadata('vue', (await params).docsPages);
}

export default async function VueDocsPage({ params }: Params) {
  return <DocsRoutePage framework="vue" slug={(await params).docsPages} />;
}
