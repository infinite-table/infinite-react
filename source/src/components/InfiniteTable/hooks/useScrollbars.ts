import { useState, useEffect, useLayoutEffect } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSourceState';
import { useManagedComponentState } from '../../hooks/useComponentState';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { InfiniteTableState, Scrollbars } from '../types';

const INITIAL_SCROLLBARS: Scrollbars = {
  vertical: false,
  horizontal: false,
};

export function useScrollbars<T>(brain: MatrixBrain) {
  const { getComponentState: getInfiniteTableState } =
    useManagedComponentState<InfiniteTableState<T>>();
  const { getState: getDataSourceState } = useDataSourceContextValue<T>();

  const [scrollbars, setScrollbars] = useState(INITIAL_SCROLLBARS);

  useEffect(() => {
    return brain.onRenderCountChange(() => {
      const { scrollTopMax, scrollLeftMax } = brain;

      setScrollbars({
        vertical: scrollTopMax > 0,
        horizontal: scrollLeftMax > 0,
      });
    });
  }, [brain]);

  useLayoutEffect(() => {
    // this needs to be useLayoutEffect
    // on live Pagination cursor change we need this - ref #lvpgn
    const dataSourceState = getDataSourceState();
    const { onScrollbarsChange } = getInfiniteTableState();
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
