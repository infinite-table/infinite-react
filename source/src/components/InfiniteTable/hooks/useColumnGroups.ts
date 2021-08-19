import { useEffect } from 'react';

import { useComponentState } from '../../hooks/useComponentState';
import { interceptMap } from '../../hooks/useInterceptedMap';
import { computeColumnGroupsDepths } from '../state/computeColumnGroupsDepths';
import { InfiniteTableComponentState } from '../types/InfiniteTableState';

export function useColumnGroups<T>() {
  const {
    componentState: { columnGroups },
    componentActions,
  } = useComponentState<InfiniteTableComponentState<T>>();

  useEffect(() => {
    const update = () => {
      componentActions.columnGroupsDepthsMap =
        computeColumnGroupsDepths(columnGroups);
    };

    return interceptMap(columnGroups, {
      clear: update,
      delete: update,
      set: update,
    });
  }, [columnGroups]);
}
