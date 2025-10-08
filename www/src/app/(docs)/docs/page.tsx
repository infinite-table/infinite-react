import { CenterContent } from '@www/app/CenterContent';
import { Page } from '@www/components/Layout/Page';

import sidebarLearn from '@www/sidebarLearn.json';

import PageHeading from '@www/components/PageHeading';

import { metadata as meta } from '../../metadata';
import { asMeta } from '@www/utils/asMeta';
import { getMarkdownHeadingsForPage } from '@www/utils/getMarkdownHeadings';
import { Toc } from '@www/components/Layout/Toc';
import { MarkdownDocsPage } from '@www/components/MarkdownDocsPage';
import { siteContent } from '../../../content';
import { MarkdownFileInfo } from '../../../utils/MarkdownFileInfo';

export const metadata = asMeta(meta);

export default function Docs() {
  const path = `/docs`;

  const pageIndex = siteContent.routes.findIndex((page) => {
    return page.routePath === path || page.routePath === `${path}/`;
  });

  const page = siteContent.routes[pageIndex] as MarkdownFileInfo;

  const anchors = getMarkdownHeadingsForPage(page.content);

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
            <PageHeading title={page.frontmatter.title}></PageHeading>
            <MarkdownDocsPage params={{ slug: [] }}></MarkdownDocsPage>
          </>
        ) : (
          <div>No Docs Page found</div>
        )}
      </CenterContent>
      {afterChildren}
    </Page>
  );
}
