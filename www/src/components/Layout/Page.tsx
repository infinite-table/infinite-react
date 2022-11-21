import { MenuContext, MenuProvider } from '@www/components/useMenu';
import cn from 'classnames';
import { wwwTheme, wwwVars } from '@www/styles/www-utils.css';
import * as React from 'react';

import { Footer } from '../Footer';
import { MainNavBar } from '../Header';
import { Nav } from './Nav';
import { Sidebar } from './Sidebar';
import { RouteItem, SidebarContext } from './useRouteMeta';
import { IconHamburger } from '../Icon/IconHamburger';
import { IconClose } from '../Icon/IconClose';
interface PageProps {
  children: React.ReactNode;
  routeTree: RouteItem;
  blog?: boolean;
}

function SecondaryNavBar() {
  const { isOpen, toggleOpen } = React.useContext(MenuContext);
  return (
    <MainNavBar skipMaxWidth>
      <button
        type="button"
        aria-label="Menu"
        onClick={toggleOpen}
        className={cn(
          'flex lg:hidden items-center h-full pl-2 sm:pl-6 pr-0 sm:pr-2',
          {
            'text-link mr-0': isOpen,
          },
        )}
      >
        {!isOpen ? <IconHamburger /> : <IconClose />}
      </button>
    </MainNavBar>
  );
}
export function Page({ routeTree, children, blog }: PageProps) {
  return (
    <>
      <MenuProvider>
        <SecondaryNavBar />

        <SidebarContext.Provider value={routeTree}>
          <div className={`h-auto lg:h-screen flex flex-row ${wwwTheme}`}>
            <div className="no-bg-scrollbar bg-black h-auto lg:h-full lg:overflow-y-scroll fixed flex flex-row lg:flex-col py-0 top-0 left-0 right-0 lg:max-w-xs w-full shadow lg:shadow-none z-50">
              {blog ? (
                <div style={{ marginTop: wwwVars.header.lineHeight }} />
              ) : (
                <Nav />
              )}
              <Sidebar blog={blog} />
            </div>

            <div className="flex flex-1 w-full h-full self-stretch">
              <div className="w-full min-w-0">
                <main
                  className="flex flex-1 self-stretch flex-col items-end text-content-color"
                  style={{
                    justifyContent: 'space-around',
                    paddingTop: wwwVars.header.lineHeight,
                  }}
                >
                  {children}
                  <Footer className="lg:pl-80 2xl:px-80" />
                </main>
              </div>
            </div>
          </div>
        </SidebarContext.Provider>
      </MenuProvider>
    </>
  );
}
