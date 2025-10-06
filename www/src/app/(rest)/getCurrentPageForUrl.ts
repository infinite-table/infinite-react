import { siteContent } from '@www/content';

export function getCurrentPageForUrl(url: string) {
  const page = siteContent.paths[url] || null;

  const page404 = siteContent.paths['/404'] || null;

  return page || page404;
}
