import Link from 'next/link';

import { SidebarContext } from '@www/components/Layout/useRouteMeta';

import { MenuContext } from '@www/components/useMenu';
import cn from 'classnames';
import * as React from 'react';

import { MobileNav } from '../Nav/MobileNav';
import { useMediaQuery } from '../useMediaQuery';

import { SidebarRouteTree } from './SidebarRouteTree';

const SIDEBAR_BREAKPOINT = 1023;

export function Sidebar({ isMobileOnly }: { isMobileOnly?: boolean }) {
  const isMobileSidebar = useMediaQuery(SIDEBAR_BREAKPOINT);

  const routeTree = React.useContext(SidebarContext);
  const isHidden = isMobileOnly && !isMobileSidebar;

  // HACK. Fix up the data structures instead.
  // if ((routeTree as any).routes.length === 1 && !blog) {
  //   routeTree = (routeTree as any).routes[0];
  // }

  const { menuRef, isOpen } = React.useContext(MenuContext);

  return (
    <aside
      className={cn(
        `docs-side-drawer lg:flex-grow lg:flex flex-col w-full pb-8 lg:pb-0 lg:max-w-xs fixed lg:sticky z-10`,
        isOpen ? 'block z-40' : 'hidden lg:block',
      )}
      aria-hidden={isHidden ? 'true' : 'false'}
      style={{
        top: 0,
        visibility: isHidden ? 'hidden' : undefined,
      }}
    >
      {/* under the fixed site header on phones */}
      <div className="lg:hidden bg-bg" style={{ height: 'var(--header-h)' }} />

      <nav
        role="navigation"
        ref={menuRef}
        style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
        className="w-full h-screen lg:h-auto flex-grow pr-0 lg:pr-5 pb-44  lg:pb-6 overflow-y-scroll lg:overflow-y-auto scrolling-touch scrolling-gpu"
      >
        {isMobileSidebar ? (
          <MobileNav routeTree={routeTree} />
        ) : (
          <SidebarRouteTree routeTree={routeTree} />
        )}
      </nav>

      <div className="docs-side-foot hidden lg:flex">
        <Link className="site-key site-key--primary" href="/pricing">
          Buy a license
        </Link>
      </div>
    </aside>
  );
}
