import { renderMarkdownPage } from '@www/components/renderMarkdownPage';

export async function MarkdownDocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  return await renderMarkdownPage({
    slug: ['docs', ...(params.slug || [])],
    baseUrl: import.meta.url,
  });
}
