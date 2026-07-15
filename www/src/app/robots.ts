import { MetadataRoute } from 'next';

// required for `output: 'export'` — emits a static robots.txt at build time
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://infinite-table.com/sitemap.xml',
  };
}
