/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

import * as React from 'react';
import NextLink from 'next/link';
import cn from 'classnames';
import { ExternalLink } from '@www/components/ExternalLink';
import { IconFacebookCircle } from '@www/components/Icon/IconFacebookCircle';
import { IconTwitter } from '@www/components/Icon/IconTwitter';

export function Footer() {
  const socialLinkClasses = 'hover:text-primary dark:text-primary-dark';
  return (
    <>
      <div className="self-stretch w-full sm:pl-0 lg:pl-80 sm:pr-0 2xl:pr-80 pl-0 pr-0">
        <div className="mx-auto w-full px-5 sm:px-12 md:px-12 pt-10 md:pt-12 lg:pt-10">
          <hr className="max-w-7xl mx-auto border-border dark:border-border-dark" />
        </div>
        <footer className="text-secondary dark:text-secondary-dark py-12 px-5 sm:px-12 md:px-12 sm:py-12 md:py-16 lg:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-x-12 gap-y-8 max-w-7xl mx-auto ">
            <div className="flex flex-col">
              <FooterLink href="/docs/latest/learn" isHeader={true}>
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
              <FooterLink href="/docs/latest/reference" isHeader={true}>
                API Reference
              </FooterLink>
              <FooterLink href="/docs/latest/reference">Props</FooterLink>
            </div>
            <div className="flex flex-col sm:col-start-2 xl:col-start-4">
              <div className="text-xs text-left mt-2 pr-0.5">
                Copyright © {new Date().getFullYear()} Infinite Table
              </div>
            </div>
            {/* <div className="flex flex-col sm:col-start-2 xl:col-start-4">
              <FooterLink href="/" isHeader={true}>
                Community
              </FooterLink>
              <FooterLink href="https://github.com/facebook/react/blob/main/CODE_OF_CONDUCT.md">
                Code of Conduct
              </FooterLink>
              <FooterLink href="/community/acknowledgements">
                Acknowledgements
              </FooterLink>
              <FooterLink href="/community/meet-the-team">
                Meet the Team
              </FooterLink>
              
            </div> */}
            {/* <div className="flex flex-col">
              <FooterLink isHeader={true}>More</FooterLink>
              <FooterLink href="https://reactnative.dev/">
                React Native
              </FooterLink>
              <FooterLink href="https://opensource.facebook.com/legal/privacy">
                Privacy
              </FooterLink>
              <FooterLink href="https://opensource.fb.com/legal/terms/">
                Terms
              </FooterLink>
              <div className="flex flex-row mt-8 gap-x-2">
                <ExternalLink
                  href="https://www.facebook.com/react"
                  className={socialLinkClasses}>
                  <IconFacebookCircle />
                </ExternalLink>
                <ExternalLink
                  href="https://twitter.com/reactjs"
                  className={socialLinkClasses}>
                  <IconTwitter />
                </ExternalLink>
              </div>
            </div> */}
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
  const classes = cn('border-b inline-block border-transparent', {
    'text-sm text-primary dark:text-primary-dark': !isHeader,
    'text-md text-secondary dark:text-secondary-dark my-2 font-bold': isHeader,
    'hover:border-gray-10': href,
  });

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
