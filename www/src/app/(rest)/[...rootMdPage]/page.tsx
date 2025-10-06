import { Metadata } from 'next';
import { getCurrentPageForUrl } from '../getCurrentPageForUrl';

import { metadata as meta } from '../../metadata';
import { asMeta } from '@www/utils/asMeta';
import { siteContent } from '@www/content';
import { renderMarkdownPage } from '../../../components/renderMarkdownPage';

export async function generateStaticParams() {
  const result = siteContent.routes
    .filter(
      (page) =>
        !page.routePath.startsWith('/docs/') &&
        !page.routePath.startsWith('/blog/'),
    )
    .map((page) => {
      return {
        rootMdPage: page.routePath
          .split('/')
          .slice(1) // to take out the first empty string
          .map((x) => x.trim())
          .filter(Boolean),
      };
    })
    .filter((x) => x.rootMdPage.length > 0); // && x.rootMdPage[0] !== '404');

  return result;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ rootMdPage: string[] }>;
}): Promise<Metadata> => {
  const p = await params;
  const url = `/${p.rootMdPage.join('/')}`;

  if (url === '/eula') {
    return {
      title: 'End User License Agreement | Infinite Table DataGrid for React',
      description: `End User License Agreement | ${meta.description}`,
    };
  }

  const page = getCurrentPageForUrl(url);

  const res = {
    title:
      page?.frontmatter?.metaTitle ??
      (page?.frontmatter?.title
        ? `${page?.frontmatter?.title} | Infinite Table DataGrid for React`
        : null) ??
      meta.title,
    description:
      page?.frontmatter.metaDescription ??
      page.frontmatter.description ??
      meta.description,
  };

  return asMeta(res);
};
export default async function Docs({
  params,
}: {
  params: Promise<{ rootMdPage: string[] }>;
}) {
  const p = await params;

  return await renderMarkdownPage({
    slug: p.rootMdPage,
    baseUrl: import.meta.url,
  });
}
