'use client';

import { MainNavBar } from '@www/components/Header';

import componentsStyle from '@www/components/components.module.css';

import { newvars } from '@www/styles/www-utils';
import { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from '@www/components/Footer';
import { MenuProvider } from '@www/components/useMenu';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const style: CSSProperties = {
    margin: '0 auto',
  };
  const pathname = usePathname() || '';

  const activePage = {
    pricing: pathname.startsWith('/pricing'),
    docs: pathname.startsWith('/docs'),
    blog: pathname.startsWith('/blog'),
  };
  const skipMaxWidth = activePage.blog || activePage.docs;

  if (!skipMaxWidth) {
    style.maxWidth = newvars.maxSiteWidth;
    //@ts-ignore
    style['--max-site-width'] = newvars.maxSiteWidth;
  }

  return (
    <MenuProvider>
      <div style={style}>
        <div
          className={`w-full flex flex-col ${componentsStyle.minHeightFull} `}
        >
          <MainNavBar />
          {children}
          <Footer />
        </div>
      </div>
    </MenuProvider>
  );
}
