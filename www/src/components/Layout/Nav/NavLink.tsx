import { ExternalLink } from '@www/components/ExternalLink';
import NextLink from 'next/link';
import * as React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

export default function NavLink({ href, children, isActive }: NavLinkProps) {
  const props = {
    className: 'docs-tab',
    'aria-current': isActive ? ('page' as const) : undefined,
  };

  if (href.startsWith('https://')) {
    return (
      <ExternalLink href={href} {...props}>
        {children}
      </ExternalLink>
    );
  }

  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
}
