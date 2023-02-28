import { AccentButton } from '@www/components/AccentButton';

import { GithubLink, TwitterLink } from '@www/components/Header';

import { SidebarContext } from '@www/components/Layout/useRouteMeta';
import { PageFindSearch } from '@www/components/PageFindSearch';

import { MenuContext } from '@www/components/useMenu';
import cn from 'classnames';
import * as React from 'react';

import { MobileNav } from '../Nav/MobileNav';
import { useMediaQuery } from '../useMediaQuery';

import { SidebarRouteTree } from './SidebarRouteTree';

const SIDEBAR_BREAKPOINT = 1023;

export function Sidebar({
  isMobileOnly,
  blog,
}: {
  isMobileOnly?: boolean;
  blog?: boolean;
}) {
  const { menuRef, isOpen } = React.useContext(MenuContext);
  const isMobileSidebar = useMediaQuery(SIDEBAR_BREAKPOINT);
  let routeTree = React.useContext(SidebarContext);
  const isHidden = isMobileOnly && !isMobileSidebar;

  // HACK. Fix up the data structures instead.
  if ((routeTree as any).routes.length === 1 && !blog) {
    routeTree = (routeTree as any).routes[0];
  }

  return (
    <aside
      className={cn(
        `lg:flex-grow lg:flex flex-col w-full pb-8 lg:pb-0 lg:max-w-xs fixed lg:sticky z-10`,
        isOpen ? 'block z-40' : 'hidden lg:block',
      )}
      aria-hidden={isHidden ? 'true' : 'false'}
      style={{
        top: 0,
        visibility: isHidden ? 'hidden' : undefined,
      }}
    >
      <div className="px-5 mt-12 lg:hidden"></div>
      <div className="hidden lg:block py-3 px-5">
        <PageFindSearch alwaysShow />
      </div>
      <nav
        role="navigation"
        ref={menuRef}
        style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
        className="w-full h-screen lg:h-auto flex-grow pr-0 lg:pr-5 pb-44  lg:pb-6 overflow-y-scroll lg:overflow-y-auto scrolling-touch scrolling-gpu"
      >
        {isMobileSidebar ? (
          <MobileNav />
        ) : (
          <SidebarRouteTree routeTree={routeTree} />
        )}
      </nav>
      <div className="px-5 py-3 sticky bottom-0 lg:px-5 w-full hidden lg:flex flex-col items-center bg-black">
        <div className="flex flex-row mb-5">
          <TwitterLink />
          <div className="ml-5"></div>
          <GithubLink />
        </div>
        <AccentButton
          className="w-full text-center mb-2"
          style={{
            display: 'block',
          }}
          href="/pricing"
        >
          Buy a License
        </AccentButton>

        {/* <div className="w-full text-center justify-center flex flex-row border rounded-lg font-bold overflow-hidden">
          <Link href={pathname === '/blog' ? '/docs' : '/blog'}>
            <a className="pr-6 border-r py-2 flex-1 text-right hover:bg-highlight hover:text-dark-custom">
              {pathname === '/blog' ? 'Docs' : 'Blog'}
            </a>
          </Link>{' '}
          <Link
            href={
              pathname.startsWith('/docs/releases')
                ? '/docs/reference'
                : '/docs/releases'
            }
          >
            <a className="pl-6 py-2  flex-1 text-left">
              {pathname.startsWith('/docs/releases') ? 'Reference' : 'Releases'}
            </a>
          </Link>
        </div> */}
      </div>
    </aside>
  );
}
