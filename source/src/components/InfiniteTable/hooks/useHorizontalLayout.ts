import { useEffect } from 'react';
import { HorizontalLayoutMatrixBrain } from '../../VirtualBrain/HorizontalLayoutMatrixBrain';

import { useInfiniteTable } from './useInfiniteTable';

export function useHorizontalLayout() {
  const { getState, actions, dataSourceActions, getDataSourceState } =
    useInfiniteTable();

  const { groupBy } = getDataSourceState();
  const { brain, wrapRowsHorizontally, repeatWrappedGroupRows } = getState();

  useEffect(() => {
    if (!wrapRowsHorizontally) {
      return;
    }

    const onVerticalRenderRangeChange = () => {
      const {
        rowsPerPage: currentRowsPerPage,
        repeatWrappedGroupRows: currentRepeatWrappedGroupRows,
      } = getDataSourceState();

      const rowsPerPage = (brain as HorizontalLayoutMatrixBrain).rowsPerPage;
      const newRowsPerPage = groupBy && groupBy.length > 0 ? rowsPerPage : null;

      if (currentRowsPerPage != newRowsPerPage) {
        dataSourceActions.rowsPerPage = newRowsPerPage;
      }

      if (currentRepeatWrappedGroupRows != !!repeatWrappedGroupRows) {
        dataSourceActions.repeatWrappedGroupRows = !!repeatWrappedGroupRows;
      }
    };

    onVerticalRenderRangeChange();

    let timeoutId: any;
    const off = brain.onVerticalRenderRangeChange(() => {
      onVerticalRenderRangeChange();
      timeoutId = setTimeout(() => {
        actions.forceBodyRerenderTimestamp = Date.now();
      });
    });

    return () => {
      clearTimeout(timeoutId);
      off();
    };
  }, [brain, wrapRowsHorizontally, groupBy, repeatWrappedGroupRows]);
}