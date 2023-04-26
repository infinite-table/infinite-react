import { CSSProperties, ReactNode } from 'react';
import componentsStyle from '@www/components/components.module.css';
import { HeroHeader } from '@www/components/Header';

export function MainLayout({
  children,

  title,

  subtitle,
  skipIndex,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  skipIndex?: boolean;

  seoTitle?: string;
  seoDescription?: string;
  className?: string;
}) {
  const domProps = {};
  if (skipIndex) {
    // @ts-ignore
    domProps['data-pagefind-ignore'] = 'all';
  }
  return (
    <div>
      <HeroHeader title={title} subtitle={subtitle} />
      {children}
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
      } flex flex-col flex-1 justify-center w-full items-center px-5 py-10 mb-10 relative ${
        dottedBg ? componentsStyle.DotsBackgroundCls : ''
      }  ${overline ? componentsStyle.OverlineCls : ''}`}
    >
      {children}
    </main>
  );
}
