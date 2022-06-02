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

    scrollCellIntoView(
      rowIndex: number,
      colIdOrIndex: string | number,
      config: {
        scrollAdjustPosition?: ScrollAdjustPosition;
        offset?: number;
      } = { offset: 0 },
    ) {
      const state = getState();
      const computed = getComputed();

      let colIndex = colIdOrIndex as number;
      if (typeof colIdOrIndex === 'string') {
        const computedColumn =
          computed.computedVisibleColumnsMap.get(colIdOrIndex);

        if (!computedColumn) {
          return;
        }
        colIndex = computedColumn.computedVisibleIndex;
      }

      const scrollPositionForCol =
        state.renderer.getScrollPositionForScrollColumnIntoView(
          colIndex,
          config,
        );
      const scrollPositionForRow =
        state.renderer.getScrollPositionForScrollRowIntoView(rowIndex, config);

      const newScrollPosition = {
        scrollLeft: scrollPositionForCol.scrollLeft,
        scrollTop: scrollPositionForRow.scrollTop,
      };
      const currentScrollPosition = state.brain.getScrollPosition();

      if (newScrollPosition.scrollLeft !== currentScrollPosition.scrollLeft) {
        state.scrollerDOMRef.current!.scrollLeft = newScrollPosition.scrollLeft;
      }
      if (newScrollPosition.scrollTop !== currentScrollPosition.scrollTop) {
        state.scrollerDOMRef.current!.scrollTop = newScrollPosition.scrollTop;
      }
    },
  };

  return imperativeApi;
}
