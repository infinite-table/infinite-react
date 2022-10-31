import {
  DotsBackgroundCls,
  fullWidthContainer,
  minHeightFull,
} from '@www/components/components.css';
import { Footer } from '@www/components/Footer';
import { HeroHeader, MainNavBar } from '@www/components/Header';
import { OverlineCls } from '@www/components/Header.css';
import { Seo } from '@www/components/Seo';
import { wwwTheme, wwwVars } from '@www/styles/www-utils.css';
import { CSSProperties, ReactNode } from 'react';

import { appClassName } from './_app.css';

export function MainLayout({
  children,
  className = '',
  title,
  seoTitle,
  seoDescription,
  subtitle,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  className?: string;
}) {
  return (
    <div
      className={`${
        className || ''
      } ${appClassName} ${wwwTheme}  bg-black text-content-color `}
    >
      <div
        style={{
          maxWidth: wwwVars.maxSiteWidth,
          margin: '0 auto',
        }}
      >
        <div className={`${fullWidthContainer} ${minHeightFull}  `}>
          <Seo
            titleSuffix={false}
            description={seoDescription}
            title={`${
              seoTitle || 'The DataGrid component for large datasets.'
            }`}
          >
            <link rel="icon" type="image/svg+xml" href="/favicon.svg"></link>
          </Seo>
          <MainNavBar />
          <HeroHeader title={title} subtitle={subtitle} />
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export function MainContent({
  children,
  overline = true,
  dottedBg = true,
  className,
  style,
}: {
  children?: React.ReactNode;
  overline?: boolean;
  className?: string;
  dottedBg?: boolean;
  style?: CSSProperties;
}) {
  return (
    <main
      style={style}
      className={`${
        className || ''
      } flex flex-col flex-1 justify-center w-full items-center px-5 mb-10 relative ${
        dottedBg ? DotsBackgroundCls : ''
      }  ${overline ? OverlineCls : ''}`}
    >
      {children}
    </main>
  );
}
