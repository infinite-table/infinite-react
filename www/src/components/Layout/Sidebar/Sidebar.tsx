import { Button } from '@www/components/Button';
import { ExternalLink } from '@www/components/ExternalLink';
import { IconOpenInWindow } from '@www/components/Icon/IconOpenInWindow';
import { SidebarContext } from '@www/components/Layout/useRouteMeta';
import { Search } from '@www/components/Search';
import { MenuContext } from '@www/components/useMenu';
import cn from 'classnames';
import * as React from 'react';

import { MobileNav } from '../Nav/MobileNav';
import { useMediaQuery } from '../useMediaQuery';

import { SidebarRouteTree } from './SidebarRouteTree';

const SIDEBAR_BREAKPOINT = 1023;

export function Sidebar({ isMobileOnly }: { isMobileOnly?: boolean }) {
  const { menuRef, isOpen } = React.useContext(MenuContext);
  const isMobileSidebar = useMediaQuery(SIDEBAR_BREAKPOINT);
  let routeTree = React.useContext(SidebarContext);
  const isHidden = isMobileOnly && !isMobileSidebar;

  // HACK. Fix up the data structures instead.
  if ((routeTree as any).routes.length === 1) {
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
        `lg:flex-grow lg:flex flex-col w-full pt-4 pb-8 lg:pb-0 lg:max-w-xs fixed lg:sticky bg-wash dark:bg-wash-dark z-10`,
        isOpen ? 'block z-40' : 'hidden lg:block',
      )}
      aria-hidden={isHidden ? 'true' : 'false'}
      style={{
        top: 0,
        visibility: isHidden ? 'hidden' : undefined,
      }}
    >
      {/* <div className="px-5"> */}
      {/* <Search /> TODO uncomment search component */}
      {/* </div> */}
      <nav
        role="navigation"
        ref={menuRef}
        style={{ '--bg-opacity': '.2' } as React.CSSProperties} // Need to cast here because CSS vars aren't considered valid in TS types (cuz they could be anything)
        className="w-full h-screen lg:h-auto flex-grow pr-0 lg:pr-5 pt-6 pb-44 lg:pb-0 lg:py-6 md:pt-4 lg:pt-4 overflow-y-scroll lg:overflow-y-auto scrolling-touch scrolling-gpu"
      >
        {isMobileSidebar ? (
          <MobileNav />
        ) : (
          <SidebarRouteTree routeTree={routeTree} />
        )}
      </nav>
      <div className="px-5 py-3 sticky bottom-0 lg:px-5 w-full hidden lg:flex flex-col items-center bg-gradient-to-t from-wash dark:from-wash-dark">
        <ExternalLink
          href="https://twitter.com/get_infinite"
          aria-label="InfiniteTable on Twitter"
          className="hover:text-link dark:hover:text-link mb-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1.33em"
            height="1.33em"
            fill="currentColor"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
          </svg>
        </ExternalLink>
        <ExternalLink
          className="hover:text-link dark:hover:text-link mb-5"
          href="https://github.com/infinite-table/infinite-react"
        >
          GitHub <IconOpenInWindow className="inline mb-2 mr-1 mt-1 text-sm" />{' '}
        </ExternalLink>
        <Button
          as="div"
          className="w-full text-center justify-center leading-relaxed"
        >
          Officially Launching in October 2022
        </Button>
        <Button
          className="w-full text-center justify-center"
          onClick={handleFeedback}
        >
          {feedbackIcon} Feedback
        </Button>
      </div>
    </aside>
  );
}
