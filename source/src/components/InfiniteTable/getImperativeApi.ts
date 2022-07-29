import { InfiniteTable_HasGrouping_RowInfoGroup } from '../../utils/groupAndPivot';
import {
  DataSourceComponentActions,
  DataSourceState,
  RowSelectionState,
} from '../DataSource';
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
  getComputed: () => InfiniteTableComputedValues<T>,
  getState: () => InfiniteTableState<T>,
  getDataSourceState: () => DataSourceState<T>,
  componentActions: InfiniteTableActions<T>,
  dataSourceActions: DataSourceComponentActions<T>,
) {
  function setGroupRowSelection(groupKeys: string[], selected: boolean) {
    const { selectionMode, rowSelection: currentRowSelection } =
      getDataSourceState();

    if (selectionMode === 'multi-row') {
      const rowSelectionState = new RowSelectionState(
        currentRowSelection as RowSelectionState<string>,
      );

      const primaryKey = `${groupKeys}`;
      const index = getDataSourceState().indexer.getIndexOf(primaryKey);
      if (index != null) {
        const rowInfo = getDataSourceState().dataArray[
          index
        ] as InfiniteTable_HasGrouping_RowInfoGroup<T>;

        rowInfo.deepRowInfoArray.forEach((rowInfo) => {
          if (!rowInfo.isGroupRow) {
            if (selected) {
              rowSelectionState.selectRow(rowInfo.id);
            } else {
              rowSelectionState.deselectRow(rowInfo.id);
            }
          }
        });
        dataSourceActions.rowSelection = rowSelectionState;

        return true;
      }
    }

    return false;
  }
  const imperativeApi: InfiniteTableImperativeApi<T> = {
    setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
      componentActions.columnOrder = columnOrder;
    },
    selectRow: (pk: any) => {
      const { selectionMode, rowSelection: currentRowSelection } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        const rowSelectionState = new RowSelectionState(
          currentRowSelection as RowSelectionState<string>,
        );

        rowSelectionState.selectRow(pk);

        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      } else if (selectionMode === 'single-row') {
        dataSourceActions.rowSelection = pk;
        return false;
      }

      return false;
    },
    deselectRow: (pk: any) => {
      const { selectionMode, rowSelection: currentRowSelection } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        const rowSelectionState = new RowSelectionState(
          currentRowSelection as RowSelectionState<string>,
        );

        rowSelectionState.deselectRow(pk);

        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      } else if (selectionMode === 'single-row') {
        dataSourceActions.rowSelection = null;

        return true;
      }

      return false;
    },
    isRowSelected: (pk: any) => {
      const { selectionMode, rowSelection } = getDataSourceState();

      if (selectionMode === 'multi-row') {
        return (rowSelection as RowSelectionState).isRowSelected(pk);
      } else if (selectionMode === 'single-row') {
        return rowSelection === pk;
      }

      return false;
    },
    selectGroupRow: (groupKeys: string[]) => {
      return setGroupRowSelection(groupKeys, true);
    },
    deselectGroupRow: (groupKeys: string[]) => {
      return setGroupRowSelection(groupKeys, false);
    },
    isGroupRowSelected: (groupKeys: string[]) => {
      const { selectionMode } = getDataSourceState();

      if (selectionMode === 'multi-row') {
        const primaryKey = `${groupKeys}`;
        const index = getDataSourceState().indexer.getIndexOf(primaryKey);

        if (index != null) {
          const rowInfo = getDataSourceState().dataArray[
            index
          ] as InfiniteTable_HasGrouping_RowInfoGroup<T>;

          return rowInfo.rowSelected;
        }
      }

      return false;
    },
    toggleRowSelection: (pk: any) => {
      const { selectionMode, rowSelection: currentRowSelection } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        const rowSelectionState = new RowSelectionState(
          currentRowSelection as RowSelectionState<string>,
        );

        rowSelectionState.toggleRowSelection(pk);

        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      } else if (selectionMode === 'single-row') {
        const rowSelection = currentRowSelection === pk ? null : pk;
        dataSourceActions.rowSelection = rowSelection;
        return true;
      }

      return false;
    },
    selectAllRows: () => {
      const { selectionMode, rowSelection: currentRowSelection } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        const rowSelectionState = new RowSelectionState(
          currentRowSelection as RowSelectionState<string>,
        );

        rowSelectionState.selectAll();
        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      }

      return false;
    },
    deselectAllRows: () => {
      const { selectionMode, rowSelection: currentRowSelection } =
        getDataSourceState();

      if (selectionMode === 'multi-row') {
        const rowSelectionState = new RowSelectionState(
          currentRowSelection as RowSelectionState<string>,
        );

        rowSelectionState.deselectAll();
        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      }

      return false;
    },
    setColumnVisibility: (
      columnVisibility: InfiniteTablePropColumnVisibility,
    ) => {
      componentActions.columnVisibility = columnVisibility;
    },
    getState,
    getDataSourceState,
    get scrollLeft() {
      const state = getState();
      return state.brain.getScrollPosition().scrollLeft;
    },
    set scrollLeft(scrollLeft: number) {
      const state = getState();
      state.scrollerDOMRef.current!.scrollLeft = Math.max(scrollLeft, 0);
    },

    get scrollTop() {
      const state = getState();
      return state.brain.getScrollPosition().scrollTop;
    },
    set scrollTop(scrollTop: number) {
      const state = getState();
      state.scrollerDOMRef.current!.scrollTop = Math.max(scrollTop, 0);
    },
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

      if (!scrollPosition) {
        return false;
      }
      const currentScrollPosition = state.brain.getScrollPosition();

      const scrollTopMax = state.brain.scrollTopMax;

      if (scrollPosition.scrollTop > scrollTopMax + (config.offset || 0)) {
        return false;
      }

      if (scrollPosition.scrollTop !== currentScrollPosition.scrollTop) {
        state.scrollerDOMRef.current!.scrollTop = scrollPosition.scrollTop;
      }
      return true;
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
        return false;
      }
      const colIndex = computedColumn.computedVisibleIndex;

      const scrollPosition =
        state.renderer.getScrollPositionForScrollColumnIntoView(
          colIndex,
          config,
        );

      if (!scrollPosition) {
        return false;
      }

      const currentScrollPosition = state.brain.getScrollPosition();

      const scrollLeftMax = state.brain.scrollLeftMax;
      if (scrollPosition.scrollLeft > scrollLeftMax + (config.offset || 0)) {
        return false;
      }

      if (scrollPosition.scrollLeft !== currentScrollPosition.scrollLeft) {
        state.scrollerDOMRef.current!.scrollLeft = scrollPosition.scrollLeft;
      }

      return true;
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
          return false;
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

      if (!scrollPositionForCol || !scrollPositionForRow) {
        return false;
      }

      const newScrollPosition = {
        scrollLeft: scrollPositionForCol.scrollLeft,
        scrollTop: scrollPositionForRow.scrollTop,
      };

      const currentScrollPosition = state.brain.getScrollPosition();

      const scrollLeftMax = state.brain.scrollLeftMax;
      const scrollTopMax = state.brain.scrollTopMax;

      const cantScrollLeft =
        newScrollPosition.scrollLeft > scrollLeftMax + (config.offset || 0);
      const cantScrollTop =
        newScrollPosition.scrollTop > scrollTopMax + (config.offset || 0);

      if (cantScrollLeft && cantScrollTop) {
        return false;
      }

      if (
        newScrollPosition.scrollLeft !== currentScrollPosition.scrollLeft &&
        !cantScrollLeft
      ) {
        state.scrollerDOMRef.current!.scrollLeft = newScrollPosition.scrollLeft;
      }
      if (
        newScrollPosition.scrollTop !== currentScrollPosition.scrollTop &&
        !cantScrollTop
      ) {
        state.scrollerDOMRef.current!.scrollTop = newScrollPosition.scrollTop;
      }

      return true;
    },
  };

  if (__DEV__) {
    (globalThis as any).imperativeApi = imperativeApi;
  }

  return imperativeApi;
}
