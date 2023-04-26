import cn from 'classnames';
import { RouteItem } from 'components/Layout/useRouteMeta';
import { usePathname } from 'next/navigation';

import sidebarLearn from '../../../sidebarLearn.json';
import sidebarReference from '../../../sidebarReference.json';
import sidebarReleases from '../../../sidebarReleases.json';

import * as React from 'react';

import { SidebarRouteTree } from '../Sidebar';

import { inferSection } from './inferSection';

export function MobileNav(_props: { routeTree: RouteItem[] }) {
  const pathname = usePathname() || '';
  const [section, setSection] = React.useState(() => inferSection(pathname));

  let tree = null; //props.routeTree;
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

  return (
    <>
      <div
        className="sticky mt-3 top-0 px-5  bg-black flex justify-end border-b border-border-dark items-center self-center w-full z-100"
        style={{
          zIndex: 100,
        }}
      >
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
      </div>
      <SidebarRouteTree routeTree={tree} isMobile={true} />
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
  const classes = cn(
    'inline-flex items-center w-full border-b-2 justify-center text-base leading-9 px-3 py-0.5 hover:text-link hover:gray-5',
    {
      'text-link border-link font-bold': isActive,
      'border-transparent': !isActive,
    },
  );
  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
