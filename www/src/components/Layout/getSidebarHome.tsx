import blogIndexRecentRouteTree from '@www/blogIndexRecent.json';

import sidebarHome from '../../sidebarHome.json';

import { RouteItem } from './useRouteMeta';

export const getSidebarHome = (): RouteItem => {
  const root = JSON.parse(JSON.stringify(sidebarHome));
  const actualRoutes = root.routes[0].routes;

  const blogRoute = actualRoutes[actualRoutes.length - 1];

  if (blogRoute.path !== '/blog') {
    return root as RouteItem;
  }

  blogRoute.routes = blogIndexRecentRouteTree.routes[0].routes;

  return root as RouteItem;
};
