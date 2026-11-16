import { CSSProperties, ReactNode } from 'react';
import { HeroHeader } from '@www/components/Header';

export function MainLayout({
  children,

  title,

  subtitle,
  heroFooter,
  skipIndex,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Shown under the hero text. */
  heroFooter?: ReactNode;
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
      <HeroHeader title={title} subtitle={subtitle}>
        {heroFooter}
      </HeroHeader>
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
      className={`page-main ${className || ''}`}
      data-overline={overline ? '' : undefined}
      data-dotted={dottedBg ? '' : undefined}
    >
      {children}
    </main>
  );
}
