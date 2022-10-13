import { ExternalLink } from '@www/components/ExternalLink';
import cn from 'classnames';
import NextLink from 'next/link';
import * as React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

export default function NavLink({ href, children, isActive }: NavLinkProps) {
  const classes = cn(
    {
      'text-link border-link dark:text-link-dark dark:border-link-dark font-bold':
        isActive,
    },
    { 'border-transparent': !isActive },
    'inline-flex w-full items-center border-b-2 justify-center text-base leading-9 px-3 py-0.5 hover:text-link dark:hover:text-link-dark whitespace-nowrap',
  );

  if (href.startsWith('https://')) {
    return (
      <ExternalLink href={href} className={classes}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <NextLink href={href}>
      <a className={classes}>{children}</a>
    </NextLink>
  );
}
