import { MDXProvider } from '@mdx-js/react';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { MainContent, MainLayout } from '@www/layouts/MainLayout';

import License from '../LICENSE.md';

import * as React from 'react';

export default function EULAPage() {
  const seoTitle =
    'Infinite Table DataGrid for React — End User License Agreement';
  const seoDescription = `Infinite Table DataGrid for React — End User License Agreement`;
  return (
    <MainLayout
      seoTitle={seoTitle}
      seoDescription={seoDescription}
      subtitle="End User License Agreement"
    >
      <MainContent>
        {/*@ts-ignore */}
        <MDXProvider components={MDXComponents}>
          <br />
          <License />
        </MDXProvider>
      </MainContent>
    </MainLayout>
  );
}
