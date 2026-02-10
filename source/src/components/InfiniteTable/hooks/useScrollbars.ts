import { useState, useEffect, useLayoutEffect } from 'react';

import { InfiniteTableState, Scrollbars } from '../types';
import { useDataSourceStableContext } from '../../DataSource/publicHooks/useDataSourceSelector';

const INITIAL_SCROLLBARS: Scrollbars = {
  vertical: false,
  horizontal: false,
};

export function useScrollbars<T>(getState: () => InfiniteTableState<T>) {
  const brain = getState().brain;
  const { getDataSourceState } = useDataSourceStableContext<T>();

  const [scrollbars, setScrollbars] = useState(INITIAL_SCROLLBARS);

  useEffect(() => {
    return brain.onRenderCountChange(() => {
      const { scrollTopMax, scrollLeftMax } = brain;

      const vertical = scrollTopMax > 0;
      const horizontal = scrollLeftMax > 0;

      setScrollbars((prev) => {
        if (prev.vertical === vertical && prev.horizontal === horizontal) {
          return prev;
        }
        return { vertical, horizontal };
      });
    });
  }, [brain]);

  useLayoutEffect(() => {
    // this needs to be useLayoutEffect
    // on live Pagination cursor change we need this - ref #lvpgn
    const dataSourceState = getDataSourceState();
    const { onScrollbarsChange } = getState();
    const { notifyScrollbarsChange } = dataSourceState;

    if (
      onScrollbarsChange &&
      // we add extra conditions so as to fire this only after initial data load
      dataSourceState.updatedAt &&
      dataSourceState.dataArray.length
    ) {
      onScrollbarsChange(scrollbars);
    }

    notifyScrollbarsChange(scrollbars);
  }, [scrollbars]);

  return scrollbars;
}
