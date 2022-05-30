import { DataSourceState } from '../DataSource';
import {
  InfiniteTableState,
  InfiniteTableImperativeApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
  InfiniteTableComputedValues,
} from './types';
import { ScrollAdjustPosition } from './types/InfiniteTableProps';
import { InfiniteTableActions } from './types/InfiniteTableState';

export function getImperativeApi<T>(
  getState: () => InfiniteTableState<T>,
  getComputed: () => InfiniteTableComputedValues<T>,
  getDataSourceState: () => DataSourceState<T>,
  componentActions: InfiniteTableActions<T>,
) {
  const imperativeApi: InfiniteTableImperativeApi<T> = {
    setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
      componentActions.columnOrder = columnOrder;
    },
    setColumnVisibility: (
      columnVisibility: InfiniteTablePropColumnVisibility,
    ) => {
      componentActions.columnVisibility = columnVisibility;
    },
    getState,
    getDataSourceState,
    scrollRowIntoView(
      rowIndex: number,
      config: {
        scrollAdjustPosition?: ScrollAdjustPosition;
        offset?: number;
      } = { offset: 0 },
    ) {
      const state = getState();

      const scrollPosition =
        state.renderer.getScrollPositionForScrollRowIntoView(rowIndex, config);
      const currentScrollPosition = state.brain.getScrollPosition();

      if (scrollPosition.scrollTop !== currentScrollPosition.scrollTop) {
        state.scrollerDOMRef.current!.scrollTop = scrollPosition.scrollTop;
      }
    },
    scrollColumnIntoView(
      colId: string,
      config: {
        scrollAdjustPosition?: ScrollAdjustPosition;
        offset?: number;
      } = { offset: 0 },
    ) {
      const state = getState();
      const computed = getComputed();

      const computedColumn = computed.computedVisibleColumnsMap.get(colId);

      if (!computedColumn) {
        return;
      }
      const colIndex = computedColumn.computedVisibleIndex;

      const scrollPosition =
        state.renderer.getScrollPositionForScrollColumnIntoView(
          colIndex,
          config,
        );
      const currentScrollPosition = state.brain.getScrollPosition();

      if (scrollPosition.scrollLeft !== currentScrollPosition.scrollLeft) {
        state.scrollerDOMRef.current!.scrollLeft = scrollPosition.scrollLeft;
      }
    },
  };

  return imperativeApi;
}
