'use client';
import { ReactNode } from 'react';
import Link from 'next/link';

import * as React from 'react';

import { DocSearch } from '@docsearch/react';

import { BannerText } from './BannerText';

import cmpStyles from './components.module.css';
import { ExternalLink } from './ExternalLink';
import { InfiniteLogo, InfiniteLogoColors } from './InfiniteLogo';
import { usePathname } from 'next/navigation';
import { MenuContext } from './useMenu';
import { IconHamburger } from './Icon/IconHamburger';
import { IconClose } from './Icon/IconClose';
import {
  DocsFrameworkSwitcher,
  useDocsFramework,
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
    href="/"
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

/** The main sections; Themes joins them with the theme gallery page. */
const SITE_NAV: { label: string; href: string; key: SiteSection }[] = [
  { label: 'Docs', href: '/docs', key: 'docs' },
  { label: 'Demo', href: '/demo', key: 'demo' },
  { label: 'Compare', href: '/compare', key: 'compare' },
  { label: 'Pricing', href: '/pricing', key: 'pricing' },
  { label: 'Blog', href: '/blog', key: 'blog' },
];

type SiteSection = 'docs' | 'demo' | 'compare' | 'pricing' | 'blog';

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

          <Link href="/" className="site-brand" aria-label="Infinite Table home">
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
          <div className="site-menu-panel">
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

export const getHeroHeaderTextStyling = () => {
  return {
    className:
      'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black opacity-70',
    style: {
      letterSpacing: '-2.8px',

      lineHeight: '1.25',
    } as React.CSSProperties,
  };
};

export const HeroHeader = (props: {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: React.ReactNode;
}) => {
  const title = props.title ?? (
    <>
      <span>One Table</span> — Infinite Applications
    </>
  );

  const subtitle = props.subtitle ?? (
    <>
      Infinite Table is the{' '}
      <BannerText
        className={`font-black`}
        setFixedWidth
        contents={[
          <>
            <span className={`text-glow`}>declarative</span>
          </>,

          <>
            <span className={`text-glow`}>modern</span>
          </>,

          <>
            <span className={`text-glow`}>lightweight</span>
            🪶
          </>,
          <>
            <span className={`text-glow`}>typed</span>
            {/* <svg
              className="inline mx-1"
              style={{ lineHeight: 0, display: 'inline' }}
              fill="none"
              height="26"
              viewBox="0 0 27 26"
              width="27"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="m.98608 0h24.32332c.5446 0 .9861.436522.9861.975v24.05c0 .5385-.4415.975-.9861.975h-24.32332c-.544597 0-.98608-.4365-.98608-.975v-24.05c0-.538478.441483-.975.98608-.975zm13.63142 13.8324v-2.1324h-9.35841v2.1324h3.34111v9.4946h2.6598v-9.4946zm1.0604 9.2439c.4289.2162.9362.3784 1.5218.4865.5857.1081 1.2029.1622 1.8518.1622.6324 0 1.2331-.0595 1.8023-.1784.5691-.1189 1.0681-.3149 1.497-.5879s.7685-.6297 1.0187-1.0703.3753-.9852.3753-1.6339c0-.4703-.0715-.8824-.2145-1.2365-.1429-.3541-.3491-.669-.6186-.9447-.2694-.2757-.5925-.523-.9692-.7419s-.8014-.4257-1.2743-.6203c-.3465-.1406-.6572-.2771-.9321-.4095-.275-.1324-.5087-.2676-.7011-.4054-.1925-.1379-.3409-.2838-.4454-.4379-.1045-.154-.1567-.3284-.1567-.523 0-.1784.0467-.3392.1402-.4824.0935-.1433.2254-.2663.3959-.369s.3794-.1824.6269-.2392c.2474-.0567.5224-.0851.8248-.0851.22 0 .4523.0162.697.0486.2447.0325.4908.0825.7382.15.2475.0676.4881.1527.7218.2555.2337.1027.4495.2216.6475.3567v-2.4244c-.4015-.1514-.84-.2636-1.3157-.3365-.4756-.073-1.0214-.1095-1.6373-.1095-.6268 0-1.2207.0662-1.7816.1987-.5609.1324-1.0544.3392-1.4806.6203s-.763.6392-1.0104 1.0743c-.2475.4352-.3712.9555-.3712 1.5609 0 .7731.2268 1.4326.6805 1.9785.4537.546 1.1424 1.0082 2.0662 1.3866.363.146.7011.2892 1.0146.4298.3134.1405.5842.2865.8124.4378.2282.1514.4083.3162.5403.4946s.198.3811.198.6082c0 .1676-.0413.323-.1238.4662-.0825.1433-.2076.2676-.3753.373s-.3766.1879-.6268.2473c-.2502.0595-.5431.0892-.8785.0892-.5719 0-1.1383-.0986-1.6992-.2959-.5608-.1973-1.0805-.4933-1.5589-.8879z"
                fill={`${wwwVars.color.brand}`}
                fillRule="evenodd"
              ></path>
            </svg> */}
          </>,
          <>
            <span className={`text-glow`}>extensible</span> 🏗
          </>,
        ]}
      />
      <br />
      <span className={'text-glow'}>React</span> DataGrid for building apps —{' '}
      <b className={`font-black`}>faster</b>
    </>
  );

  return (
    <div
      className={[
        'relative  mb-20 w-full flex flex-col items-center justify-center',
      ].join(' ')}
    >
      <h1
        style={{
          ...getHeroHeaderTextStyling().style,
          zIndex: 1,
        }}
        className={[
          'mt-40 md:mt-52',
          getHeroHeaderTextStyling().className,
          'text-center',
        ].join(' ')}
      >
        <div className="relative">
          <div
            className={`${cmpStyles.SpotlightRadialBackgroundCls}`}
            style={{
              height: 500,
              top: '-50%',
              left: '-30%',
              opacity: 1,
              zIndex: -1,
            }}
          />

          <div
            className={`${cmpStyles.HighlightBrandToLightBackground} px-3 relative text-5xl md:text-6xl lg:text-7xl`}
          >
            {title}
          </div>
        </div>
      </h1>
      {subtitle ? (
        <h2
          className={`text-4xl leading-relaxed mt-20 text-center font-bold text-white justify-center opacity-70`}
          style={{
            zIndex: 2,
            maxWidth: '80%',
            letterSpacing: '-1px',
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </h2>
      ) : null}
      {props.children}
    </div>
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
