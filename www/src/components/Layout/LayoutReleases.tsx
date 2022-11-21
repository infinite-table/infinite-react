import { RouteItem } from 'components/Layout/useRouteMeta';
import * as React from 'react';

import sidebarReleases from '../../sidebarReleases.json';

import { MarkdownPage, MarkdownProps } from './MarkdownPage';
import { Page } from './Page';

interface PageFrontmatter {
  title: string;
}

export default function withReleases(meta: PageFrontmatter) {
  function LayoutReleases(props: MarkdownProps<PageFrontmatter>) {
    return <MarkdownPage {...props} meta={meta} />;
  }
  LayoutReleases.appShell = AppShell;
  return LayoutReleases;
}

function AppShell(props: { children: React.ReactNode }) {
  return <Page {...props} routeTree={sidebarReleases as any as RouteItem} />;
}
