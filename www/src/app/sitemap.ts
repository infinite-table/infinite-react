import { MetadataRoute } from 'next';

import { siteContent } from '@www/content';
import { getBlogPosts } from '@www/utils/blogUtils';

import { getAllTagsFromPosts, tagHref } from './blog/blogTagUtils';

const BASE_URL = 'https://infinite-table.com';

// required for `output: 'export'` — emits a static sitemap.xml at build time
export const dynamic = 'force-static';

function normalizePath(path: string) {
  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = new Map<string, MetadataRoute.Sitemap[number]>();

  const add = (path: string, entry?: Partial<MetadataRoute.Sitemap[number]>) => {
    const normalized = normalizePath(path);
    urls.set(normalized, {
      url: `${BASE_URL}${normalized === '/' ? '' : normalized}`,
      ...entry,
    });
  };

  // app-router pages that don't come from markdown content
  add('/');
  add('/blog');
  add('/pricing');
  add('/full-demo');
  add('/devtools');

  // all markdown-driven pages: docs, comparison, community, eula, privacy.
  // blog posts are added below (with dates and draft filtering), so skip them here.
  siteContent.routes.forEach((route) => {
    const path = normalizePath(route.routePath);
    if (
      path === '/404' ||
      path.startsWith('/blog') ||
      route.frontmatter?.draft === true
    ) {
      return;
    }
    add(path);
  });

  const posts = getBlogPosts({ skipDrafts: true });

  posts.forEach((post) => {
    add(post.path, {
      lastModified: post.date ? new Date(post.date) : undefined,
    });
  });

  getAllTagsFromPosts(posts).forEach((tag) => {
    add(tagHref(tag));
  });

  return Array.from(urls.values());
}
