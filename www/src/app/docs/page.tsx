import { CenterContent } from '@www/app/CenterContent';
import { Page } from '@www/components/Layout/Page';

import sidebarLearn from '@www/sidebarLearn.json';

import { MDXContent } from '@www/components/MDXContent';
import PageHeading from '@www/components/PageHeading';
import { allDocsPages, type DocsPage } from 'contentlayer/generated';
import { metadata as meta } from './metadata';
import { asMeta } from '@www/utils/asMeta';
import { getMarkdownHeadingsForPage } from '@www/utils/getMarkdownHeadings';
import { Toc } from '@www/components/Layout/Toc';

export const metadata = asMeta(meta);

export default function Docs() {
  const path = `/docs`;

  const pageIndex = allDocsPages.findIndex((page) => page.url === path);
  const page = allDocsPages[pageIndex] as DocsPage;

  const anchors = getMarkdownHeadingsForPage(page.body.raw);

  const afterChildren =
    anchors && anchors.length ? (
      <div className="w-full lg:max-w-xs hidden 2xl:block">
        <Toc headings={anchors} />
      </div>
    ) : null;
  return (
    <Page routeTree={sidebarLearn}>
      <CenterContent>
        {page ? (
          <>
            <PageHeading title={page.title}></PageHeading>
            <MDXContent>{page.body.code}</MDXContent>
          </>
        ) : (
          <div>No Docs Page found</div>
        )}
      </CenterContent>
      {afterChildren}
    </Page>
  );
}
