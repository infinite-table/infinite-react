import { RouteItem } from 'components/Layout/useRouteMeta';
import { usePathname } from 'next/navigation';

import sidebarLearn from '../../../sidebarLearn.json';
import sidebarReference from '../../../sidebarReference.json';
import sidebarReleases from '../../../sidebarReleases.json';

import * as React from 'react';

import { SidebarRouteTree } from '../Sidebar';

import { inferSection } from './inferSection';
import { SiteNavLinks } from '@www/components/Header';
import {
  DocsFrameworkSwitcher,
  useDocsFramework,
} from '@www/components/DocsFrameworks';

export function MobileNav(props: { routeTree: RouteItem[] }) {
  const pathname = usePathname() || '';
  const isBlog = pathname.startsWith('/blog');
  const docs = useDocsFramework();
  const [section, setSection] = React.useState(() =>
    inferSection(docs.neutralPath),
  );

  let tree: RouteItem[] | null = null; //props.routeTree;
  switch (section) {
    case 'learn':
      tree = sidebarLearn;
      break;
    case 'reference':
      tree = sidebarReference;
      break;
    case 'releases':
      tree = sidebarReleases;
      break;
  }

  if (isBlog) {
    tree = props.routeTree;
  } else if (tree) {
    // on /vue/docs/...: the Vue pages (and the React ones it doesn't have yet)
    tree = docs.routesFor(tree);
  }

  return (
    <>
      {/* the site sections, which the header has no room for on a phone */}
      <SiteNavLinks className="site-menu-links--drawer" />
      <div
        className="docs-tabs docs-tabs--drawer sticky top-0 z-100"
        style={{
          zIndex: 100,
        }}
      >
        {isBlog ? (
          <>
            <TabButton isActive onClick={() => {}}>
              Blog
            </TabButton>
          </>
        ) : (
          <>
            <TabButton
              isActive={section === 'learn'}
              onClick={() => setSection('learn')}
            >
              Learn
            </TabButton>
            <TabButton
              isActive={section === 'reference'}
              onClick={() => setSection('reference')}
            >
              Reference
            </TabButton>
            <TabButton
              isActive={section === 'releases'}
              onClick={() => setSection('releases')}
            >
              Releases
            </TabButton>
          </>
        )}
      </div>

      {/* on a phone the header has no room for the switcher on docs pages */}
      {isBlog ? null : (
        <div className="docs-drawer-switcher sm:hidden">
          <DocsFrameworkSwitcher />
        </div>
      )}
      <SidebarRouteTree routeTree={tree ?? []} isMobile={true} />
    </>
  );
}

function TabButton({
  children,
  onClick,
  isActive,
}: {
  children: any;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      className="docs-tab"
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
