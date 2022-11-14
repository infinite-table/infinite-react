import * as React from 'react';

import { MarkdownArticle, MarkdownProps } from './MarkdownPage';

interface PageFrontmatter {
  title: string;
  description?: string;
}

export default function withNoDocs(meta: PageFrontmatter) {
  function LayoutNoDocs(props: MarkdownProps<PageFrontmatter>) {
    return (
      <MarkdownArticle
        {...props}
        nextRoute={undefined}
        prevRoute={undefined}
        route={undefined}
        isHomePage={true}
        skipIndex
        skipReserveSidebarSpace={true}
        title={meta.title}
        description={meta.description}
      />
    );
  }

  return LayoutNoDocs;
}
