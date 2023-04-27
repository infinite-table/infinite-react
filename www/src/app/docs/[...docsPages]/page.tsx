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

import { metadata as meta } from '../metadata';
import { Metadata } from 'next';
import { asMeta } from '@www/utils/asMeta';

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

  console.log('result', result);
  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: { docsPages: string[] };
}): Promise<Metadata> => {
  const path = `/docs/${params.docsPages.join('/')}`;
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

export default function DocsPage({
  params,
}: {
  params: { docsPages: string[] };
}) {
  const path = `/docs/${params.docsPages.join('/')}`;

  const page404 = allRootPages.find((page) => page.url === '/404') as RootPage;

  const pageIndex = allDocsPages.findIndex((page) => page.url === path);
  const page = allDocsPages[pageIndex] ?? page404;

  let sidebar: RouteItem[] = sidebarLearn;

  if (path.startsWith('/docs/reference')) {
    sidebar = sidebarReference;
  }
  if (path.startsWith('/docs/releases')) {
    sidebar = sidebarReleases;
  }

  return (
    <Page routeTree={sidebar}>
      <CenterContent>
        <PageHeading title={page.title}></PageHeading>
        <MDXContent>{page.body.code}</MDXContent>
      </CenterContent>
    </Page>
  );
}
