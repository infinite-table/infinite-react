import { useEffect } from 'react';

import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';

import { computeColumnGroupsDepths } from '../state/computeColumnGroupsDepths';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';
import { rafFn } from '../utils/rafFn';

export function useColumnGroups<T>() {
  const {
    componentState: {
      computedColumnGroups: computedColumnGroups,
      collapsedColumnGroups,
    },
    componentActions,
    getComponentState,
  } = useComponentState<InfiniteTableComponentState<T>>();

  useEffect(() => {
    const recompute = () => {
      componentActions.columnGroupsDepthsMap =
        computeColumnGroupsDepths(computedColumnGroups);
    };

    const update = rafFn(recompute);

    return interceptMap(computedColumnGroups, {
      clear: update,
      delete: update,
      set: update,
    });
  }, [computedColumnGroups]);

  // TODO we need to enhance this when we implement the UI for collapsing column groups
  useEffect(() => {
    // when collapsedColumnGroups change
    //we basically update the columnVisibility map
    return interceptMap(collapsedColumnGroups, {
      set: (key: string[], visibleCol: string) => {
        const colIds = key.slice(1);
        const { columnVisibility } = getComponentState();

        colIds.forEach((colId) => {
          columnVisibility.set(colId, false);
        });
        columnVisibility.delete(visibleCol);
      },
      beforeClear: (currentCollapsedGroups) => {
        const { columnVisibility } = getComponentState();
        const keys = [...currentCollapsedGroups.keys()];
        keys.forEach((key) => {
          const colIds = key.slice(1);
          colIds.forEach((colId) => {
            columnVisibility.delete(colId);
          });
        });
      },
      delete: (key: string[]) => {
        const { columnVisibility } = getComponentState();
        const colIds = key.slice(1);
        colIds.forEach((colId) => {
          columnVisibility.delete(colId);
        });
      },
    });
  }, [collapsedColumnGroups]);
}
