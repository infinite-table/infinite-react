import { useEffect, useState } from 'react';

import { useDataSourceContextValue } from '../../DataSource/publicHooks/useDataSource';
import { RowSelectionState } from '../../DataSource/RowSelectionState';

import { MultiRowSelector } from '../utils/MultiRowSelector';

import { useInfiniteTable } from './useInfiniteTable';

export function useRowSelection<T>() {
  const { getState } = useInfiniteTable<T>();

  const [multiRowSelector] = useState(() => {
    const multiRowSelector = new MultiRowSelector({
      getIdForIndex: (index: number) =>
        getDataSourceState().dataArray[index].id,
    });

    return multiRowSelector;
  });

  const { getState: getDataSourceState, componentActions } =
    useDataSourceContextValue<T>();

  useEffect(() => {
    const removeOnClick = getState().cellClick.onChange((args) => {
      if (args == null) {
        return;
      }
      const { rowIndex, event } = args;

      let { rowSelection: rowSelectionState, selectionMode } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        // clone the row selection
        rowSelectionState = new RowSelectionState(
          rowSelectionState as RowSelectionState<string>,
        );

        multiRowSelector.rowSelectionState = rowSelectionState;

        if (rowSelectionState && typeof rowSelectionState === 'object') {
          if (event.shiftKey) {
            multiRowSelector.multiSelectClick(rowIndex);
          } else if (event.metaKey || event.ctrlKey) {
            multiRowSelector.singleAddClick(rowIndex);
          } else {
            multiRowSelector.resetClick(rowIndex);
          }

          // so we can give actions a new instance of rowSelection
          componentActions.rowSelection = rowSelectionState;
        }
      } else if (selectionMode === 'single-row') {
      }
    });

    const removeOnKeyDown = getState().keyDown.onChange((event) => {
      let { rowSelection: rowSelectionState, selectionMode } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        if (event?.key === 'a' && (event.ctrlKey || event.metaKey)) {
          // clone the row selection
          rowSelectionState = new RowSelectionState(
            rowSelectionState as RowSelectionState<string>,
          );

          rowSelectionState.selectAll();

          componentActions.rowSelection = rowSelectionState;
        }
      }
    });

    return () => {
      removeOnClick();
      removeOnKeyDown();
    };
  }, [multiRowSelector]);
}
