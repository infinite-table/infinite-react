import { ExternalLink } from '@www/components/ExternalLink';
import cn from 'classnames';
import NextLink from 'next/link';
import * as React from 'react';

function Link({
  href,
  className,
  children,
  ...props
}: React.JSX.IntrinsicElements['a']) {
  const classes =
    'inline text-link break-normal border-b border-transparent hover:border-link duration-100 ease-in transition leading-normal';
  const modifiedChildren = React.Children.toArray(children).map(
    (child: any, _idx: number) => {
      if (child.props?.mdxType && child.props?.mdxType === 'inlineCode') {
        return React.cloneElement(child, {
          isLink: true,
        });
      }
      return child;
    },
  );

  if (!href) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={href} className={className} {...props} />;
  }
  return (
    <>
      {href.startsWith('https://') ? (
        <ExternalLink href={href} className={cn(classes, className)} {...props}>
          {modifiedChildren}
        </ExternalLink>
      ) : href.startsWith('#') ? (
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a className={cn(classes, className)} href={href} {...props}>
          {modifiedChildren}
        </a>
      ) : (
        //@ts-ignore
        <NextLink
          href={href.replace('.html', '')}
          className={cn(classes, className)}
          {...props}
        >
          {modifiedChildren}
        </NextLink>
      )}
    </>
  );
}

Link.displayName = 'Link';

export default Link;
