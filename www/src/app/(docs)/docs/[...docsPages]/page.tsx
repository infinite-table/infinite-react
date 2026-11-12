import type { Metadata } from 'next';

import {
  docsPageMetadata,
  docsStaticParams,
  DocsRoutePage,
} from '@www/components/DocsRoutePage';

type Params = { params: Promise<{ docsPages: string[] }> };

export function generateStaticParams() {
  return docsStaticParams('react');
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return docsPageMetadata('react', (await params).docsPages);
}

export default async function DocsPage({ params }: Params) {
  return <DocsRoutePage framework="react" slug={(await params).docsPages} />;
}
