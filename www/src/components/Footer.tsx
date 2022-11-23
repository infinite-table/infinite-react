import * as React from 'react';
import cn from 'classnames';

import { shadow, alignSelf } from '../styles/www-utils.css';

import { footer } from './components.css';

// import { DocsPageFooter } from './DocsFooter';
import { OverlineCls } from './Header.css';
import { ExternalLink } from './ExternalLink';
import Link from 'next/link';
import { GithubLink, TwitterLink } from './Header';

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
    'border-b inline-block border-transparent text-content-color',
    {
      'text-base ': !isHeader,
      'text-md my-2 font-bold': isHeader,
      'hover:border-content-color': href,
    },
  );

  if (!href) {
    return <div className={classes}>{children}</div>;
  }

  if (href.startsWith('https://') || href.startsWith('mailto')) {
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
      <Link href={href}>
        <a className={classes}>{children}</a>
      </Link>
    </div>
  );
}
export const Footer = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <>
      <footer
        className={`${
          props.className || ''
        } justify-center items-center self-end w-full flex flex-col ${
          shadow.lg
        } bg-black text-content-color ${OverlineCls} relative py-10`}
      >
        {/* Copyright © {new Date().getFullYear()} Infinite Table */}
        <div className="flex flex-col sm:grid grid-cols-4 gap-8">
          <div className="flex flex-col items-start">
            <FooterLink isHeader={true}>Infinite Table</FooterLink>

            <FooterLink href="/docs/learn/getting-started">
              Get Started
            </FooterLink>
            {/* <FooterLink href="/docs/learn/styling-rows">
              Styling Rows
            </FooterLink> */}

            <FooterLink href="/pricing">Get a License</FooterLink>
          </div>
          <div className="flex flex-col items-start">
            <FooterLink isHeader>API Reference</FooterLink>
            <FooterLink href="/docs/reference">Props</FooterLink>
            <FooterLink href="/docs/reference/api">API</FooterLink>
          </div>

          <div className="flex flex-col items-start ">
            <FooterLink isHeader={true}>Social</FooterLink>

            <GithubLink className="items-center border-b border-transparent hover:border-b hover:border-content-color text-base">
              GitHub{' '}
            </GithubLink>
            <TwitterLink className="items-center border-b border-transparent  hover:border-content-color text-base">
              Twitter
            </TwitterLink>
            <FooterLink href="/community">Community</FooterLink>
          </div>
          <div className="flex flex-col items-start">
            <FooterLink isHeader={true}>Company</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            {/* <FooterLink href="/privacy">EULA</FooterLink> */}
            <FooterLink href="/eula">License & Terms</FooterLink>

            <FooterLink href="mailto:admin@infinite-table.com">
              Email Us
            </FooterLink>
            <div className="text-base">
              Copyright © {new Date().getFullYear()}
              <div className=" block text-right">Infinite Table</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
