import { MainContent, MainLayout } from '@www/layouts/MainLayout';

import * as React from 'react';

import { renderMarkdownPage } from '../src/components/renderMarkdownPage';

export default async function PrivacyPage() {
  const seoTitle = 'Infinite Table DataGrid for React — Terms of Use';
  const seoDescription = `Infinite Table DataGrid for React — Terms of Use`;
  return (
    <MainLayout
      seoTitle={seoTitle}
      seoDescription={seoDescription}
      subtitle="Terms of Use - coming soon"
    >
      <MainContent>
        {await renderMarkdownPage({
          slug: ['terms-of-use'],
          baseUrl: import.meta.url,
        })}
      </MainContent>
    </MainLayout>
  );
}
