import * as React from 'react';
import NextLink from 'next/link';
import cn from 'classnames';
import { ExternalLink } from '@www/components/ExternalLink';
import { IconOpenInWindow } from '../Icon/IconOpenInWindow';

export function Footer() {
  const socialLinkClasses =
    'hover:text-primary dark:text-primary-dark';
  return (
    <>
      <div className="self-stretch w-full sm:pl-0 lg:pl-80 sm:pr-0 2xl:pr-80 pl-0 pr-0">
        <div className="mx-auto w-full px-5 sm:px-12 md:px-12 pt-10 md:pt-12 lg:pt-10">
          <hr className="max-w-7xl mx-auto border-border dark:border-border-dark" />
        </div>
        <footer className="text-secondary dark:text-secondary-dark py-12 px-5 sm:px-12 md:px-12 sm:py-12 md:py-16 lg:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-x-12 gap-y-8 max-w-7xl mx-auto ">
            <div className="flex flex-col">
              <FooterLink
                href="/docs/latest/learn"
                isHeader={true}>
                Learn Infinite Table
              </FooterLink>
              <FooterLink href="/docs/latest/learn/getting-started">
                Getting Started
              </FooterLink>
              <FooterLink href="/docs/latest/learn/styling-rows">
                Styling Rows
              </FooterLink>
            </div>
            <div className="flex flex-col">
              <FooterLink
                href="/docs/latest/reference"
                isHeader={true}>
                API Reference
              </FooterLink>
              <FooterLink href="/docs/latest/reference">
                Props
              </FooterLink>
            </div>

            <div className="flex flex-col sm:col-start-2 xl:col-start-4 mb-2">
              <div className="my-2">
                <ExternalLink
                  className="hover:text-link dark:hover:text-link "
                  href="https://github.com/infinite-table/infinite-react">
                  GitHub{' '}
                  <IconOpenInWindow className="inline mb-2 mr-1 mt-1 text-sm" />{' '}
                </ExternalLink>
              </div>
              <div className="text-xs text-left pr-0.5">
                Copyright © {new Date().getFullYear()}
                <br /> Infinite Table
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FooterLink({
  href,
  children,
  isHeader = false,
}: {
  href?: string;
  children: React.ReactNode;
  isHeader?: boolean;
}) {
  const classes = cn(
    'border-b inline-block border-transparent',
    {
      'text-sm text-primary dark:text-primary-dark':
        !isHeader,
      'text-md text-secondary dark:text-secondary-dark my-2 font-bold':
        isHeader,
      'hover:border-gray-10': href,
    }
  );

  if (!href) {
    return <div className={classes}>{children}</div>;
  }

  if (href.startsWith('https://')) {
    return (
      <div>
        <ExternalLink href={href} className={classes}>
          {children}
        </ExternalLink>
      </div>
    );
  }

  return (
    <div>
      <NextLink href={href}>
        <a className={classes}>{children}</a>
      </NextLink>
    </div>
  );
}
