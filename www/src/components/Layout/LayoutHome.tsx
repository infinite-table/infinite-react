import * as React from 'react';
import { getSidebarHome } from './getSidebarHome';

import {
  MarkdownPage,
  MarkdownProps,
} from './MarkdownPage';
import { Page } from './Page';
import { RouteItem } from './useRouteMeta';

interface PageFrontmatter {
  title: string;
  status: string;
}

export default function withDocs(p: PageFrontmatter) {
  function LayoutHome(
    props: MarkdownProps<PageFrontmatter>
  ) {
    return <MarkdownPage {...props} meta={p} />;
  }
  LayoutHome.appShell = AppShell;
  return LayoutHome;
}

function AppShell(props: { children: React.ReactNode }) {
  return (
    <Page
      routeTree={getSidebarHome() as RouteItem}
      {...props}
    />
  );
}
