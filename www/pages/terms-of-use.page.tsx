import { MDXProvider } from '@mdx-js/react';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { MainContent, MainLayout } from '@www/layouts/MainLayout';

import PrivacyContent from './terms-of-use.md';

import * as React from 'react';

export default function PrivacyPage() {
  const seoTitle = 'Infinite Table DataGrid for React — Terms of Use';
  const seoDescription = `Infinite Table DataGrid for React — Terms of Use`;
  return (
    <MainLayout
      seoTitle={seoTitle}
      seoDescription={seoDescription}
      subtitle="Terms of Use - coming soon"
    >
      <MainContent>
        {/*@ts-ignore */}
        <MDXProvider components={MDXComponents}>
          <PrivacyContent />
        </MDXProvider>
      </MainContent>
    </MainLayout>
  );
}
