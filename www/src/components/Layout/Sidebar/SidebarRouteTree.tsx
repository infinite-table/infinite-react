import { removeFromLast } from '@www/utils/removeFromLast';
import { RouteItem } from 'components/Layout/useRouteMeta';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { useLayoutEffect } from 'react';
import useCollapse from '@gaearon/react-collapsed';

import { SidebarLink } from './SidebarLink';

interface SidebarRouteTreeProps {
  isMobile?: boolean;
  routeTree: RouteItem[];
  level?: number;
}

function CollapseWrapper({
  isExpanded,
  duration,
  children,
}: {
  isExpanded: boolean;
  duration: number;
  children: any;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const { getCollapseProps } = useCollapse({
    isExpanded,
    duration,
  });
  const collapsedProps = getCollapseProps();

  const [_x, setx] = React.useState(0);

  const rerender = () => setx((x) => x + 1);

  // Disable pointer events while animating.
  const isExpandedRef = React.useRef(isExpanded);
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      const wasExpanded = isExpandedRef.current;
      if (wasExpanded === isExpanded) {
        return;
      }
      isExpandedRef.current = isExpanded;
      if (isExpanded) {
        transitioningRef.current = true;
      }
      if (ref.current !== null) {
        const node: HTMLDivElement = ref.current;
        node.style.pointerEvents = 'none';
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          node.style.pointerEvents = '';
          if (isExpanded) {
            (node.firstElementChild as HTMLElement)!.style.height = '';
            // node.firstChild.style.he
          }
        }, duration + 100);
      }
    });
  }

  const transitioningRef = React.useRef(false);

  const style: React.CSSProperties = { ...collapsedProps.style };
  collapsedProps.onTransitionEnd = () => {
    transitioningRef.current = false;
    rerender();
  };
  if (isExpanded && !transitioningRef.current) {
    delete style.height;
  }
  return (
    <div
      ref={ref}
      style={{
        opacity: isExpanded ? 1 : 0.5,
        transition: `opacity ${duration}ms ease-in-out`,
        animation: `nav-fadein ${duration}ms ease-in-out`,
      }}
    >
      <div {...getCollapseProps()} style={style}>
        {children}
      </div>
    </div>
  );
}

function isRouteExpanded(route: RouteItem, pathname: string) {
  let expanded = !!(route.path && pathname.startsWith(route.path));

  if (!expanded && route.routes) {
    expanded = route.routes.some((r) => isRouteExpanded(r, pathname));
  }

  return expanded;
}
export function SidebarRouteTree({
  isMobile,
  routeTree,
  level = 0,
}: SidebarRouteTreeProps) {
  // const { breadcrumbs } = useRouteMeta(routeTree);
  // console.log('breadcrumbs', breadcrumbs);
  const pathname = usePathname() || '';

  const slug = pathname;

  const currentRoutes = routeTree ?? [];

  return (
    <ul
      className={`bg-dark-custom  border-border-dark lg:bg-transparent ${
        level === 0 ? 'lg:pt-6' : ''
      }`}
    >
      {currentRoutes
        .filter((route) => !route.draft)
        .map((route) => {
          const { path, title, routes, transient, badge } = route;
          const pagePath = path && removeFromLast(path, '.');

          const selected = slug === pagePath && !transient;

          // if current route item has no path and children treat it as an API sidebar heading
          // if (!path || !pagePath || heading) {
          //   return (
          //     <SidebarRouteTree
          //       key={`${index}-${level}`}
          //       level={level + 1}
          //       isMobile={isMobile}
          //       routeTree={{ title, routes }}
          //     />
          //   );
          // }

          // if route has a path and child routes, treat it as an expandable sidebar item
          if (routes) {
            // console.log({ expanded, path });
            const isExpanded = isMobile || isRouteExpanded(route, pathname); //expanded === path;
            const content = (
              <SidebarRouteTree
                isMobile={isMobile}
                routeTree={routes}
                level={level + 1}
              />
            );
            return (
              <li key={`${title}-${path}-${level}-heading`}>
                <SidebarLink
                  key={`${title}-${path}-${level}-link`}
                  href={pagePath || ''}
                  selected={selected}
                  level={level}
                  badge={badge}
                  title={title}
                  isExpanded={isExpanded}
                  isBreadcrumb={false}
                  hideArrow={isMobile}
                />
                {isMobile ? (
                  content
                ) : (
                  <CollapseWrapper duration={200} isExpanded={isExpanded}>
                    {content}
                  </CollapseWrapper>
                )}
              </li>
            );
          }

          // if route has a path and no child routes, treat it as a sidebar link
          return (
            <li key={`${title}-${path}-${level}-link`}>
              <SidebarLink
                href={pagePath || ''}
                badge={badge}
                selected={selected}
                level={level}
                title={title}
              />
            </li>
          );
        })}
    </ul>
  );
}
