import { useMemo } from 'react';

import { useDataSourceMasterDetailSelector } from '../../DataSource/publicHooks/useDataSourceMasterDetailSelector';
import { getMenuPortalContainer } from '../utils/menuOverlayTargets';
import { useInfiniteTableSelector } from './useInfiniteTableSelector';

/**
 * The portal container for the table menus: the `menuPortalContainer` prop,
 * otherwise the master table's portal element (for detail grids), otherwise
 * inline.
 */
export function useMenuPortalContainer() {
  const { getState, menuPortalContainer } = useInfiniteTableSelector((ctx) => {
    return {
      getState: ctx.getState,
      menuPortalContainer: ctx.state.menuPortalContainer,
    };
  });
  const { portalDOMRef } =
    useDataSourceMasterDetailSelector((ctx) => {
      return {
        portalDOMRef: ctx.getMasterState().portalDOMRef,
      };
    }) || {};
  const defaultContainer = portalDOMRef?.current;

  return useMemo(
    () =>
      getMenuPortalContainer(getState, menuPortalContainer, defaultContainer),
    [getState, menuPortalContainer, defaultContainer],
  );
}
