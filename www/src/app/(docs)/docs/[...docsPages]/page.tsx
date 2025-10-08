import { CenterContent } from '@www/app/CenterContent';
import PageHeading from '@www/components/PageHeading';

import { Page, type RouteItem } from '@www/components/Layout/Page';

import sidebarLearn from '@www/sidebarLearn.json';
import sidebarReference from '@www/sidebarReference.json';
import sidebarReleases from '@www/sidebarReleases.json';

import { metadata as meta } from '../../../metadata';
import { Metadata } from 'next';
import { asMeta } from '@www/utils/asMeta';
import {
  getMarkdownHeadingsForPage,
  getPropHeadings,
  TocHeading,
} from '@www/utils/getMarkdownHeadings';
import { Toc } from '@www/components/Layout/Toc';
import { redirect } from 'next/navigation';

import { siteContent } from '@www/content';

import { MarkdownDocsPage } from '@www/components/MarkdownDocsPage';

export async function generateStaticParams() {
  const result = siteContent.routes
    .filter((page) => page.routePath.startsWith('/docs/'))

    .map((page) => {
      return {
        docsPages: page.routePath
          .split('/')
          .slice(2) // to take out the first empty string and the '/docs' portion
          .map((x) => x.trim())
          .filter(Boolean),
      };
    })
    .filter((x) => x.docsPages.length > 0);

  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ docsPages: string[] }>;
}): Promise<Metadata> => {
  const p = await params;

  const path = `/docs/${p.docsPages.join('/')}`;

  const page = siteContent.paths[path];

  const res = {
    title:
      page?.frontmatter?.title ??
      (page?.frontmatter?.title
        ? `${page?.frontmatter?.title} | Infinite Table DataGrid for React`
        : null) ??
      meta.title,
    description:
      page?.frontmatter?.description ?? page?.excerpt ?? meta.description,
  };

  return asMeta(res);
};

export default async function DocsPage({
  params,
}: {
  params: Promise<{ docsPages: string[] }>;
}) {
  const p = await params;
  const path = `/docs/${p.docsPages.join('/')}`;

  const page404 = siteContent.paths['/404'];

  const page =
    siteContent.paths[path] ?? siteContent.paths[path + '/'] ?? page404;

  if (page && page.frontmatter.redirect_to) {
    const redirect_to = page.frontmatter.redirect_to;

    redirect(redirect_to);
  }

  let sidebar: RouteItem[] = sidebarLearn;
  let anchors: TocHeading[] = [];

  if (path.startsWith('/docs/reference')) {
    sidebar = sidebarReference;
  }
  if (path.startsWith('/docs/releases')) {
    sidebar = sidebarReleases;
  }
  if (sidebar === sidebarReference) {
    anchors = getPropHeadings(page.content);
  } else {
    anchors = getMarkdownHeadingsForPage(page.content);
  }

  const afterChildren =
    anchors && anchors.length ? (
      <div className="w-full lg:max-w-xs hidden 2xl:block">
        <Toc headings={anchors} noHighlight={sidebar === sidebarReference} />
      </div>
    ) : null;

  // console.log('DOCS PAGES slug', p.docsPages);
  return (
    <Page routeTree={sidebar}>
      <CenterContent>
        <PageHeading
          title={page.frontmatter.title}
          since={page.frontmatter.since}
        ></PageHeading>
        <MarkdownDocsPage params={{ slug: p.docsPages }}></MarkdownDocsPage>
      </CenterContent>
      {afterChildren}
    </Page>
  );
}
