import * as React from 'react';

/**
 * While Next.js provides file-based routing, we still need to construct
 * a sidebar for navigation and provide each markdown page
 * previous/next links and titles. To do this, we construct a nested
 * route object that is infinitely nestable.
 */

export type RouteTag =
  | 'foundation'
  | 'intermediate'
  | 'advanced'
  | 'experimental'
  | 'deprecated';

export interface RouteItem {
  /** Page title (for the sidebar) */
  title: string;
  draft?: boolean;
  /** Optional page description for heading */
  description?: string;
  /* Additional meta info for page tagging */
  tags?: RouteTag[];
  /** Path to page */
  path?: string;
  /** Whether the entry is a heading */
  heading?: boolean;
  transient?: boolean;
  /** List of sub-routes */
  routes?: RouteItem[];
}

export interface Routes {
  /** List of routes */
  routes: RouteItem[];
}

/** Routing metadata about a given route and it's siblings and parent */
export interface RouteMeta {
  /** The previous route */
  prevRoute?: RouteItem;
  /** The next route */
  nextRoute?: RouteItem;
  /** The current route */
  route?: RouteItem;
  /** Trail of parent routes */
  breadcrumbs?: RouteItem[];
}

export const SidebarContext = React.createContext<RouteItem[]>([
  { title: 'root' },
]);
