import { removeFromLast } from '@www/utils/removeFromLast';

import NextLink from 'next/link';
import * as React from 'react';


export type DocsPageRoute = {
  path: string;
  title: string;
  heading?: boolean;
};
export type DocsPageFooterProps = {
  route: DocsPageRoute;
  nextRoute?: DocsPageRoute;
  prevRoute?: DocsPageRoute;
};

function areEqual(prevProps: DocsPageFooterProps, props: DocsPageFooterProps) {
  return prevProps.route?.path === props.route?.path;
}

export const DocsPageFooter = React.memo<DocsPageFooterProps>(
  function DocsPageFooter({ nextRoute, prevRoute, route }) {
    if (!route || route?.heading) {
      return null;
    }

    return (
      <>
        {prevRoute?.path || nextRoute?.path ? (
          <>
            <div className="docs-pager">
              {prevRoute?.path ? (
                <FooterLink
                  type="Previous"
                  title={prevRoute.title}
                  href={removeFromLast(prevRoute.path, '.')}
                />
              ) : (
                <div />
              )}

              {nextRoute?.path ? (
                <FooterLink
                  type="Next"
                  title={nextRoute.title}
                  href={removeFromLast(nextRoute.path, '.')}
                />
              ) : (
                <div />
              )}
            </div>
          </>
        ) : null}
      </>
    );
  },
  areEqual,
);

function FooterLink({
  href,
  title,
  type,
}: {
  href: string;
  title: string;
  type: 'Previous' | 'Next';
}) {
  return (
    <NextLink
      href={href}
      className={`docs-pager__link docs-pager__link--${type.toLowerCase()}`}
    >
      <span className="docs-pager__type">
        {type === 'Previous' ? '← ' : ''}
        {type}
        {type === 'Next' ? ' →' : ''}
      </span>
      <b>{title}</b>
    </NextLink>
  );
}

DocsPageFooter.displayName = 'DocsPageFooter';
