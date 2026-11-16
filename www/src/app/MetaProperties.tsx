'use client';

import { usePathname } from 'next/navigation';
import { getBlogPostByPath } from '../utils/blogUtils';

export function MetaProperties() {
  const pathname = usePathname();

  const post = getBlogPostByPath(pathname);

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
