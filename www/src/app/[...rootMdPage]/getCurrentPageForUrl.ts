import { allRootPages, type RootPage } from 'contentlayer/generated';

export function getCurrentPageForUrl(url: string) {
  const page = allRootPages.find((page) => page.url === url) || null;

  console.log(allRootPages.map((page) => page.url));
  const page404 = allRootPages.find((page) => page.url === '/404') || null;

  return (page || page404) as RootPage;
}
