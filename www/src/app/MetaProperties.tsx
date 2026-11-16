'use client';

import { usePathname } from 'next/navigation';

/**
 * Takes the blog post paths from the (server) layout rather than reading
 * the content index itself: as a client component, importing it would ship
 * the whole site's content to every page.
 */
export function MetaProperties({ blogPostPaths }: { blogPostPaths: string[] }) {
  const pathname = usePathname();

  const post = pathname.startsWith('/blog/') && blogPostPaths.includes(pathname);

  return (
    <>
      <link rel="icon shortcut" type="image/x-icon" href="/favicon.ico"></link>
      {!post ? (
        <>
          <meta
            property="og:url"
            key="og:url"
            content={`https://infinite-table.com${
              pathname === '/' ? '' : pathname
            }`}
          />
          <meta property="og:type" key="og:type" content="website" />
        </>
      ) : null}

      <link
        rel="canonical"
        href={`https://infinite-table.com${pathname === '/' ? '' : pathname}`}
      />
    </>
  );
}
