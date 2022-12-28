import { AccentButton } from '@www/components/AccentButton';
import { Button } from '@www/components/Button';

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

  function handleFeedback() {
    const nodes: any = document.querySelectorAll(
      '#_hj_feedback_container button',
    );
    if (nodes.length > 0) {
      nodes[nodes.length - 1].click();
    } else {
      window.location.href =
        'https://github.com/infinite-table/infinite-react/discussions/3';
    }
  }
  const feedbackIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      className="mr-2"
      viewBox="0 0 24 24"
    >
      <g fill="none" fillRule="evenodd" transform="translate(-444 -204)">
        <g fill="currentColor" transform="translate(354.5 205)">
          <path d="M102.75 14C102.75 14.6905 102.1905 15.25 101.5 15.25 100.8095 15.25 100.25 14.6905 100.25 14 100.25 13.3095 100.8095 12.75 101.5 12.75 102.1905 12.75 102.75 13.3095 102.75 14M101 5.25L101.5 11 102 5.25C102 5.25 102 4.75 101.5 4.75 101 4.75 101 5.25 101 5.25" />
          <path
            fillRule="nonzero"
            d="M100.25282,5.31497221 L100.75282,11.0649722 C100.832243,11.9783426 102.167757,11.9783426 102.24718,11.0649722 L102.74718,5.31497221 L102.75,5.25 C102.75,5.08145956 102.716622,4.88119374 102.60832,4.6645898 C102.407353,4.2626558 102.01337,4 101.5,4 C100.98663,4 100.592647,4.2626558 100.39168,4.6645898 C100.283378,4.88119374 100.25,5.08145956 100.25,5.25 L100.25282,5.31497221 Z M101.249053,5.22834322 L101.24717,5.25 L101.75283,5.25 L101.750947,5.22834322 L101.5,5.20652174 L101.249053,5.22834322 Z M101.25,5.25 L101.75,5.25 C101.75,5.29354044 101.747872,5.30630626 101.73332,5.3354102 C101.688603,5.4248442 101.57587,5.5 101.5,5.5 C101.42413,5.5 101.311397,5.4248442 101.26668,5.3354102 C101.252128,5.30630626 101.25,5.29354044 101.25,5.25 Z"
          />
          <path
            fillRule="nonzero"
            d="M96.2928885,18.5085 L109.75,18.5085 C111.268908,18.5085 112.5085,17.268908 112.5085,15.75 L112.5085,3.25 C112.5085,1.73109202 111.268908,0.4915 109.75,0.4915 L93.25,0.4915 C91.731092,0.4915 90.4915,1.73109202 90.4915,3.25 L90.4915,21.5 C90.4915,22.3943136 91.5519083,22.8250723 92.1764221,22.2491522 L92.230357,22.1957095 L96.2928885,18.5085 Z M92.0085,3.25 C92.0085,2.56890798 92.568908,2.0085 93.25,2.0085 L109.75,2.0085 C110.431092,2.0085 110.9915,2.56890798 110.9915,3.25 L110.9915,15.75 C110.9915,16.431092 110.431092,16.9915 109.75,16.9915 L96,16.9915 C95.8115227,16.9915 95.6297966,17.0616721 95.4902321,17.1883427 L92.0085,20.3484106 L92.0085,3.25 Z"
          />
        </g>
        <polygon points="444 228 468 228 468 204 444 204" />
      </g>
    </svg>
  );

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
