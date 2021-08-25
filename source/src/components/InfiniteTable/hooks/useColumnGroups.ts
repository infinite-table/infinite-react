import { useEffect } from 'react';

import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';

import { computeColumnGroupsDepths } from '../state/computeColumnGroupsDepths';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';

export function useColumnGroups<T>() {
  const {
    componentState: { columnGroups, collapsedColumnGroups },
    componentActions,
    getComponentState,
  } = useComponentState<InfiniteTableComponentState<T>>();

  useEffect(() => {
    const recompute = () => {
      componentActions.columnGroupsDepthsMap =
        computeColumnGroupsDepths(columnGroups);
    };

    let rafId: number = 0;
    const update = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        recompute();
      });
    };

    return interceptMap(columnGroups, {
      clear: update,
      delete: update,
      set: update,
    });
  }, [columnGroups]);

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
