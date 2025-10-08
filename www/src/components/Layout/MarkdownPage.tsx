'use client';

import { DocsPageFooter } from '@www/components/DocsFooter';

import * as React from 'react';

export interface MarkdownProps<Frontmatter> {
  meta: Frontmatter & { description?: string };
  children?: React.ReactNode;
}

export function MaxWidth({
  children,
  className,
  style,
}: {
  children: any;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`max-w-7xl ml-0 2xl:mx-auto ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export function MarkdownArticle(props: {
  skipIndex?: boolean;
  route: any | undefined;
  nextRoute: any | undefined;
  prevRoute: any | undefined;
  children?: React.ReactNode;
  afterChildren?: React.ReactNode;
  skipReserveSidebarSpace?: boolean;
}) {
  const {
    route,
    nextRoute,
    prevRoute,
    children,
    afterChildren,
    skipReserveSidebarSpace,
    skipIndex,
  } = props;
  const showDocsFooter = route || nextRoute || prevRoute;

  const domProps: React.HTMLProps<HTMLDivElement> = {};

  if (skipIndex) {
    //@ts-ignore
    domProps['data-pagefind-ignore'] = 'all';
  } else {
    //@ts-ignore
    domProps['data-pagefind-body'] = '';
  }
  return (
    <article className="h-full mx-auto relative w-full min-w-0" {...domProps}>
      <div
        className={
          skipReserveSidebarSpace ? '' : 'lg:pt-0 pl-0 lg:pl-80 2xl:px-80 '
        }
      >
        {/* <Seo title={title} description={description} /> */}

        <div className="px-4 sm:px-12">
          <div className="max-w-7xl mx-auto">{children}</div>
          {showDocsFooter ? (
            <DocsPageFooter
              route={route}
              nextRoute={nextRoute}
              prevRoute={prevRoute}
            />
          ) : null}
        </div>
      </div>
      {afterChildren}
    </article>
  );
}
