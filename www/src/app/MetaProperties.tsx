'use client';

import { usePathname } from 'next/navigation';

export function MetaProperties() {
  const pathname = usePathname();

  return (
    <>
      <meta
        property="og:image"
        content="https://infinite-table.com/og-image.png"
      />
      <link rel="icon shortcut" type="image/x-icon" href="/favicon.ico"></link>

      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="680" />
      <meta property="og:type" key="og:type" content="website" />
      <meta
        property="og:url"
        key="og:url"
        content={`https://infinite-table.com${
          pathname === '/' ? '' : pathname
        }`}
      />
      <link
        rel="canonical"
        href={`https://infinite-table.com${pathname === '/' ? '' : pathname}`}
      />
    </>
  );
}
