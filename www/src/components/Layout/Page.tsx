import { MenuProvider } from '@www/components/useMenu';
import { wwwTheme } from '@www/styles/www-utils.css';
import * as React from 'react';

import { Footer } from '../Footer';
import { Nav } from './Nav';
import { Sidebar } from './Sidebar';
import { RouteItem, SidebarContext } from './useRouteMeta';
interface PageProps {
  children: React.ReactNode;
  routeTree: RouteItem;
}

export function Page({ routeTree, children }: PageProps) {
  return (
    <MenuProvider>
      <SidebarContext.Provider value={routeTree}>
        <div className={`h-auto lg:h-screen flex flex-row ${wwwTheme}`}>
          <div className="no-bg-scrollbar bg-black h-auto lg:h-full lg:overflow-y-scroll fixed flex flex-row lg:flex-col py-0 top-0 left-0 right-0 lg:max-w-xs w-full shadow lg:shadow-none z-50">
            <Nav />
            <Sidebar />
          </div>

          <div className="flex flex-1 w-full h-full self-stretch">
            <div className="w-full min-w-0">
              <main
                className="flex flex-1 self-stretch flex-col items-end text-content-color"
                style={{ justifyContent: 'space-around' }}
              >
                {children}
                <Footer className="lg:pl-80 2xl:px-80" />
              </main>
            </div>
          </div>
        </div>
      </SidebarContext.Provider>
    </MenuProvider>
  );
}
