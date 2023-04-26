// import { allPosts } from 'contentlayer/generated';
import { Page } from '@www/components/Layout/Page';
import React from 'react';
import { sortedPosts } from './sortedPosts';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Page
      blog
      routeTree={[
        {
          title: 'Blog',
          heading: true,
          path: '/blog',
          routes: sortedPosts.map((post) => {
            return {
              title: post.title,
              path: post.url,
            };
          }),
        },
      ]}
    >
      {children}
    </Page>
  );
}
