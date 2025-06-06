import { CenterContent } from '@www/app/CenterContent';
import { MDXContent } from '@www/components/MDXContent';
import PageHeading from '@www/components/PageHeading';

import { Page, type RouteItem } from '@www/components/Layout/Page';
import sidebarLearn from '@www/sidebarLearn.json';
import sidebarReference from '@www/sidebarReference.json';
import sidebarReleases from '@www/sidebarReleases.json';

import {
  allDocsPages,
  allRootPages,
  RootPage,
  type DocsPage,
} from 'contentlayer/generated';

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

export async function generateStaticParams() {
  const result = allDocsPages
    .map((page) => {
      return {
        docsPages: page.url
          .split('/')
          .slice(2) // to take out the first empty string and the '/docs' portion
          .map((x) => x.trim())
          .filter(Boolean),
      };
    })
    .filter((x) => x.docsPages.length > 0);

  // console.log('result', result);
  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: { docsPages: string[] };
}): Promise<Metadata> => {
  const p = await params;
  const path = `/docs/${p.docsPages.join('/')}`;
  const pageIndex = allDocsPages.findIndex((page) => page.url === path);
  const page = allDocsPages[pageIndex];

  const res = {
    title:
      page?.metaTitle ??
      (page?.title
        ? `${page?.title} | Infinite Table DataGrid for React`
        : null) ??
      meta.title,
    description: page?.metaDescription ?? page?.description ?? meta.description,
  };

  return asMeta(res);
};

export default async function DocsPage({
  params,
}: {
  params: { docsPages: string[] };
}) {
  const p = await params;
  const path = `/docs/${p.docsPages.join('/')}`;

  const page404 = allRootPages.find((page) => page.url === '/404') as RootPage;

  const pageIndex = allDocsPages.findIndex((page) => page.url === path);
  const page = allDocsPages[pageIndex] ?? page404;

  if (page && page.redirect_to) {
    const redirect_to = page.redirect_to;

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
    anchors = getPropHeadings(page.body.raw);
  } else {
    anchors = getMarkdownHeadingsForPage(page.body.raw);
  }

  const afterChildren =
    anchors && anchors.length ? (
      <div className="w-full lg:max-w-xs hidden 2xl:block">
        <Toc headings={anchors} noHighlight={sidebar === sidebarReference} />
      </div>
    ) : null;
  return (
    <Page routeTree={sidebar}>
      <CenterContent>
        <PageHeading title={page.title} since={page.since}></PageHeading>

        <MDXContent>{page.body.code}</MDXContent>
      </CenterContent>
      {afterChildren}
    </Page>
  );
}
