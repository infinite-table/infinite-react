import { useEffect } from 'react';

import { useInfiniteTable } from './useInfiniteTable';

export function useHorizontalLayout() {
  const { getState, actions, dataSourceActions, getDataSourceState } =
    useInfiniteTable();

  const { groupBy, isTree } = getDataSourceState();
  const state = getState();
  const { brain, wrapRowsHorizontally } = state;
  let repeatWrappedGroupRows = state.repeatWrappedGroupRows;

  if (!wrapRowsHorizontally) {
    repeatWrappedGroupRows = false;
  }

  useEffect(() => {
    if (!wrapRowsHorizontally) {
      if (getDataSourceState().repeatWrappedGroupRows) {
        dataSourceActions.repeatWrappedGroupRows = false;
      }
      return;
    }

    const onVerticalRenderRangeChange = () => {
      const {
        rowsPerPage: currentRowsPerPage,
        repeatWrappedGroupRows: currentRepeatWrappedGroupRows,
      } = getDataSourceState();

      let changes = false;

      const rowsPerPage = brain.rowsPerPage;
      const newRowsPerPage =
        ((groupBy && groupBy.length > 0) || isTree) && rowsPerPage > 0
          ? rowsPerPage
          : null;

      if (currentRowsPerPage != newRowsPerPage) {
        dataSourceActions.rowsPerPage = newRowsPerPage;
        changes = true;
      }

      if (currentRepeatWrappedGroupRows != repeatWrappedGroupRows) {
        dataSourceActions.repeatWrappedGroupRows =
          repeatWrappedGroupRows ?? false;
        changes = true;
      }

      return changes;
    };

    onVerticalRenderRangeChange();

    let timeoutId: any;
    const off = brain.onVerticalRenderRangeChange(() => {
      if (onVerticalRenderRangeChange()) {
        timeoutId = setTimeout(() => {
          // unfortunately, we need to force a rerender of the body
          // because by the time the render range changes, the DataSource has not finished recomputing
          // the artificial group rows, so we need to trigger this re-render
          actions.forceBodyRerenderTimestamp = Date.now();
        });
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      off();
    };
  }, [brain, wrapRowsHorizontally, groupBy, isTree, repeatWrappedGroupRows]);
}
