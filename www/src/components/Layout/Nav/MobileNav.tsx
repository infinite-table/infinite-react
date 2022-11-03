import cn from 'classnames';
import { RouteItem } from 'components/Layout/useRouteMeta';
import { useRouter } from 'next/router';
import * as React from 'react';

import sidebarLearn from '../../../sidebarLearn.json';
import sidebarReference from '../../../sidebarReference.json';
import { getSidebarHome } from '../getSidebarHome';
import { SidebarRouteTree } from '../Sidebar';

import { inferSection } from './inferSection';

const sidebarHome = getSidebarHome();

export function MobileNav() {
  const { pathname } = useRouter();
  const [section, setSection] = React.useState(() => inferSection(pathname));

  let tree = null;
  switch (section) {
    case 'home':
      tree = sidebarHome.routes![0];
      break;
    case 'learn':
      tree = sidebarLearn.routes[0];
      break;
    case 'reference':
      tree = sidebarReference.routes[0];
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
          isActive={section === 'home'}
          onClick={() => setSection('home')}
        >
          Home
        </TabButton>
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
      </div>
      <SidebarRouteTree routeTree={tree as RouteItem} isMobile={true} />
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
