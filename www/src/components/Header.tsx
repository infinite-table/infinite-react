'use client';
import { ReactNode } from 'react';
import Link from 'next/link';

import * as React from 'react';

import { DocSearch } from '@docsearch/react';


import { ExternalLink } from './ExternalLink';
import { InfiniteLogo, InfiniteLogoColors } from './InfiniteLogo';
import { usePathname } from 'next/navigation';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { MenuContext } from './useMenu';
import { IconHamburger } from './Icon/IconHamburger';
import { IconClose } from './Icon/IconClose';
import {
  DocsFrameworkSwitcher,
  useDocsFramework,
  useDocsFrameworkHome,
} from '@www/components/DocsFrameworks';
import { ThemeToggle } from './ThemeToggle';

export function TwitterLink(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ExternalLink
      href="https://twitter.com/get_infinite"
      aria-label="InfiniteTable on Twitter"
      className={`inline-flex ${props.className || ''}`}
    >
      {props.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1.33rem"
        height="1.33rem"
        className={props.children ? 'ml-1' : ''}
        fill="currentColor"
      >
        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
      </svg>
    </ExternalLink>
  );
}
export function GithubLink(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ExternalLink
      href="https://github.com/infinite-table/infinite-react"
      className={`inline-flex ${props.className || ''}`}
    >
      {props.children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.33rem"
        height="1.33rem"
        viewBox="0 0 1024 1024"
        className={props.children ? 'ml-1' : ''}
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
          transform="scale(64)"
          fill="currentColor"
        />
      </svg>{' '}
    </ExternalLink>
  );
}

export const LogoAndTitle = (props: {
  color?: InfiniteLogoColors;
  title?: string;
}) => (
  <Link
    href={useDocsFrameworkHome()}
    data-logo
    className={`inline-flex items-center font-black text-lg sm:text-4xl sm:mr-4`}
    style={{ width: 'max-content' }}
  >
    <InfiniteLogo
      className="py-5 px-1 sm:px-2 sm:py-3 max-w-min"
      color={props.color}
    />

    <span className="whitespace-nowrap text-content-color">
      {props.title || 'Infinite Table'}
    </span>
  </Link>
);

/** The main sections of the site. */
const SITE_NAV: { label: string; href: string; key: SiteSection }[] = [
  { label: 'Docs', href: '/docs', key: 'docs' },
  { label: 'Demo', href: '/demo', key: 'demo' },
  { label: 'Themes', href: '/themes', key: 'themes' },
  { label: 'Compare', href: '/compare', key: 'compare' },
  { label: 'Pricing', href: '/pricing', key: 'pricing' },
  { label: 'Blog', href: '/blog', key: 'blog' },
];

type SiteSection = 'docs' | 'demo' | 'themes' | 'compare' | 'pricing' | 'blog';

/** At this width and up the nav links show and the menu button goes (site-shell.css). */
const NAV_BREAKPOINT = 1024;

function useSiteSection(): {
  section: SiteSection | null;
  hasSidebar: boolean;
  hrefFor: (href: string) => string;
} {
  const pathname = usePathname() || '';
  const docs = useDocsFramework();
  let section: SiteSection | null = null;
  if (docs.framework != null) section = 'docs';
  else if (/^\/demo\/?$/.test(pathname)) section = 'demo';
  else if (pathname.startsWith('/themes')) section = 'themes';
  else if (pathname.startsWith('/compare')) section = 'compare';
  else if (pathname.startsWith('/pricing')) section = 'pricing';
  else if (pathname.startsWith('/blog')) section = 'blog';
  return {
    section,
    // the docs and the blog have their own sidebar, which is the menu on phones
    hasSidebar: section === 'docs' || section === 'blog',
    // Docs goes to the docs of the framework you are on
    hrefFor: (href) => (href === '/docs' ? docs.hrefFor('/docs') : href),
  };
}

/** The site links as a list, for the phone menus (header panel, docs drawer). */
export function SiteNavLinks({ className = '' }: { className?: string }) {
  const { section, hrefFor } = useSiteSection();
  return (
    <nav className={`site-menu-links ${className}`} aria-label="Main">
      {SITE_NAV.map((item) => (
        <Link
          key={item.key}
          href={hrefFor(item.href)}
          aria-current={section === item.key ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SiteSearch() {
  return (
    <div className="site-search">
      <DocSearch
        appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!}
        indexName="infinite-table"
        apiKey={process.env.NEXT_PUBLIC_ALGOLIA_API_KEY!}
        placeholder="Search the docs"
        // the index has absolute production URLs; stay on this site
        // (local dev, preview deploys)
        transformItems={(items) =>
          items.map((item) => ({
            ...item,
            url: item.url.replace(/^https:\/\/infinite-table\.com/, ''),
          }))
        }
      />
    </div>
  );
}

export const MainNavBar = () => {
  const { section, hasSidebar, hrefFor } = useSiteSection();
  const { toggleOpen, hideSidebar, isOpen } = React.useContext(MenuContext);
  const home = useDocsFrameworkHome();

  // the header's own menu panel (pages without a sidebar); Escape closes it
  const panelOpen = isOpen && !hasSidebar;

  // the menu (panel or docs drawer) only exists below the nav breakpoint:
  // close it when the window grows past it (resize, tablet rotation), which
  // also releases the drawer's body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;
    const wide = window.matchMedia(`(min-width: ${NAV_BREAKPOINT}px)`);
    if (wide.matches) {
      hideSidebar();
      return;
    }
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) hideSidebar();
    };
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, [isOpen, hideSidebar]);
  // the page behind the open panel doesn't scroll (the docs drawer locks
  // the scroll itself, in useMenu; these pages have no drawer)
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panelOpen || !panel) return;
    disableBodyScroll(panel);
    return () => enableBodyScroll(panel);
  }, [panelOpen]);
  React.useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hideSidebar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen, hideSidebar]);

  return (
    <div className="site-header-space">
      <header
        className={`site-header ${
          hasSidebar || section === 'demo' ? 'site-header--full' : ''
        }`}
      >
        <div className="site-header__wrap">
          <button
            type="button"
            className="site-icon-btn site-menu-btn"
            aria-label={isOpen ? 'Close the menu' : 'Open the menu'}
            aria-expanded={isOpen}
            onClick={toggleOpen}
          >
            {isOpen ? <IconClose /> : <IconHamburger />}
          </button>

          <Link href={home} className="site-brand" aria-label="Infinite Table home">
            <i className="site-brand__mark" aria-hidden="true" />
            <span>Infinite Table</span>
          </Link>

          <nav className="site-nav" aria-label="Main">
            {SITE_NAV.map((item) => (
              <Link
                key={item.key}
                href={hrefFor(item.href)}
                aria-current={section === item.key ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__tools">
            <SiteSearch />
            {/*
              No room for it in a phone's header: there, the docs menu has
              the switcher and the home pages link to each other under the
              hero text.
            */}
            <DocsFrameworkSwitcher className="site-header__switcher" />
            <ThemeToggle />
            <ExternalLink
              href="https://github.com/infinite-table/infinite-react"
              aria-label="Infinite Table on GitHub"
              className="site-icon-btn site-header__github"
            >
              <IconGitHub />
            </ExternalLink>
          </div>
        </div>

        {panelOpen ? (
          <div className="site-menu-panel" ref={panelRef}>
            <SiteNavLinks />
            <div className="site-menu-panel__row">
              <DocsFrameworkSwitcher />
              <ExternalLink
                href="https://github.com/infinite-table/infinite-react"
                className="site-menu-panel__link"
              >
                GitHub
              </ExternalLink>
            </div>
          </div>
        ) : null}
      </header>
    </div>
  );
};

function IconGitHub() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  );
}

/** The hero of the plain pages (pricing, the markdown pages): see pages.css. */
export const HeroHeader = (props: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: React.ReactNode;
}) => {
  const title = props.title ?? <>One Table — Infinite Applications</>;
  const subtitle =
    props.subtitle === undefined
      ? 'The DataGrid for React and Vue, built for speed.'
      : props.subtitle;

  return (
    <section className="page-hero">
      <div className="page-hero__wrap">
        <h1 className="page-hero__title">{title}</h1>
        {subtitle ? <div className="page-hero__sub">{subtitle}</div> : null}
        {props.children}
      </div>
    </section>
  );
};
export const Header = (props: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <>
      <MainNavBar />
      <HeroHeader {...props} />
    </>
  );
};
