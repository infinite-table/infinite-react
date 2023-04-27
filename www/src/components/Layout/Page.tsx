'use client';

import { newvars } from '@www/styles/www-utils';
import * as React from 'react';

import { Nav } from './Nav';
import { Sidebar } from './Sidebar';
import { RouteItem, SidebarContext } from './useRouteMeta';
interface PageProps {
  children: React.ReactNode;
  routeTree: RouteItem[];
  blog?: boolean;
}

export type { RouteItem };

export function Page({ routeTree, children, blog }: PageProps) {
  // const { isOpen, toggleOpen } = React.useContext(MenuContext);
  return (
    <>
      <SidebarContext.Provider value={routeTree}>
        <div className={`h-auto  flex flex-row`} data-pagefind-body>
          {' '}
          {/*lg:min-h-screen*/}
          <div
            style={{ zIndex: 2000 }}
            className="no-bg-scrollbar bg-black h-auto lg:h-full lg:overflow-y-scroll fixed flex flex-row lg:flex-col py-0 top-0 left-0 right-0 lg:max-w-xs w-full shadow lg:shadow-none "
          >
            {blog ? (
              <div style={{ marginTop: newvars.header.lineHeight }} />
            ) : (
              <Nav />
            )}
            <Sidebar />
          </div>
          <div className="flex flex-1 w-full h-full self-stretch">
            <div className="w-full min-w-0">
              <main
                className="flex flex-1 self-stretch flex-col items-end text-content-color"
                style={{
                  justifyContent: 'space-around',
                }}
              >
                {children}
              </main>
            </div>
          </div>
        </div>
      </SidebarContext.Provider>
    </>
  );
}
