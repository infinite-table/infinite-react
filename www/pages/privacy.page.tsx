import { MDXProvider } from '@mdx-js/react';
import { MDXComponents } from '@www/components/MDX/MDXComponents';
import { MainContent, MainLayout } from '@www/layouts/MainLayout';

import PrivacyContent from './privacy.md';

import * as React from 'react';

export default function PrivacyPage() {
  const seoTitle = 'Infinite Table DataGrid for React — Privacy Policy';
  const seoDescription = `Infinite Table DataGrid for React — Privacy Policy`;
  return (
    <MainLayout
      seoTitle={seoTitle}
      seoDescription={seoDescription}
      subtitle="Privacy Policy"
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
