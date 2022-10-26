import {
  DotsBackgroundCls,
  fullWidthContainer,
  minHeightFull,
} from '@www/components/components.css';
import { Footer } from '@www/components/Footer';
import { HeroHeader, MainNavBar } from '@www/components/Header';
import { OverlineCls } from '@www/components/Header.css';
import { Seo } from '@www/components/Seo';
import { lightTheme, maxWidth, wwwVars } from '@www/styles/www-utils.css';
import { ReactNode } from 'react';

import { appClassName } from './_app.css';

export function MainLayout({
  children,
  className = '',
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${
        className || ''
      } ${appClassName} ${lightTheme}  bg-black text-content-color `}
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
            title="Infinite Table for React | the DataGrid component for large datasets"
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
}: {
  children?: React.ReactNode;
  overline?: boolean;
}) {
  return (
    <main
      className={`flex flex-col flex-1 justify-center w-full items-center px-5 relative ${DotsBackgroundCls}  ${
        overline ? OverlineCls : ''
      }`}
    >
      {children}
    </main>
  );
}
