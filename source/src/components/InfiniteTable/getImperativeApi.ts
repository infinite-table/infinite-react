import { DeepMap } from '../../utils/DeepMap';
import {
  InfiniteTable_HasGrouping_RowInfoGroup,
  LAZY_ROOT_KEY_FOR_GROUPS,
} from '../../utils/groupAndPivot';
import {
  DataSourceComponentActions,
  DataSourceState,
  GroupRowsState,
  RowSelectionState,
} from '../DataSource';
import { getChangeDetect } from '../DataSource/privateHooks/getChangeDetect';
import { loadData } from '../DataSource/privateHooks/useLoadData';
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
    const {
      selectionMode,
      rowSelection: currentRowSelection,
      groupDeepMap,
      toPrimaryKey,
    } = getDataSourceState();

    if (selectionMode === 'multi-row' && groupDeepMap) {
      const rowSelectionState = new RowSelectionState(
        currentRowSelection as RowSelectionState<string>,
      );
      const groupResult = groupDeepMap.get(groupKeys);

      if (groupResult?.items) {
        groupResult.items.forEach((data) => {
          const id = toPrimaryKey(data);
          if (selected) {
            rowSelectionState.selectRow(id);
          } else {
            rowSelectionState.deselectRow(id);
          }
        });
        dataSourceActions.rowSelection = rowSelectionState;
        return true;
      }
    }

    return false;
  }
  const imperativeApi: InfiniteTableImperativeApi<T> = {
    get allRowsSelected() {
      return getDataSourceState().allRowsSelected;
    },
    getSelectedRowCount() {
      const { selectionMode, selectedRowCount } = getDataSourceState();
      if (selectionMode != 'multi-row') {
        throw `Cannot get the selected row count unless "selectionMode" is "multi-row"!`;
      }
      return selectedRowCount;
    },
    getSelectedRows() {
      // TODO continue here this does not return rows from collapsed groups
      // because the indexer cant find them - we should index also before the filtering/grouping operations occur

      const { rowSelection, indexer, dataArray } = getDataSourceState();

      if (!rowSelection || !(rowSelection instanceof RowSelectionState)) {
        return [];
      }

      if (rowSelection.isRowDefaultDeselected()) {
        const { selectedRows } = rowSelection.getState();
        return Object.keys(selectedRows).reduce((res, id) => {
          const index = indexer.getIndexOf(id);
          if (index == null) {
            return res;
          }
          const rowInfo = dataArray[index];
          if (!rowInfo || !rowInfo.data) {
            return res;
          }
          res.push(rowInfo.data as T);
          return res;
        }, [] as T[]);
      } else {
        // by default, rows are selected
        return dataArray
          .filter((rowInfo) => {
            return (
              !rowInfo.isGroupRow && rowSelection.isRowSelected(rowInfo.id)
            );
          })
          .map((rowInfo) => rowInfo.data as T);
      }
      return [];
    },
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
    toggleGroupRow(groupKeys: any[]) {
      const state = getDataSourceState();
      const newState = new GroupRowsState(state.groupRowsState);
      newState.toggleGroupRow(groupKeys);

      dataSourceActions.groupRowsState = newState;
      if (state.lazyLoad) {
        const dataKeys = [LAZY_ROOT_KEY_FOR_GROUPS, ...groupKeys];
        const currentData = state.originalLazyGroupData.get(dataKeys);

        if (newState.isGroupRowExpanded(groupKeys)) {
          if (!currentData?.cache) {
            loadData(state.data, state, dataSourceActions, {
              groupKeys,
            });
          }
        } else {
          if (!currentData?.cache) {
            const keysToDelete =
              state.lazyLoadCacheOfLoadedBatches.getKeysStartingWith(groupKeys);
            keysToDelete.forEach((keys) => {
              state.lazyLoadCacheOfLoadedBatches.delete(keys);
            });

            dataSourceActions.lazyLoadCacheOfLoadedBatches = DeepMap.clone(
              state.lazyLoadCacheOfLoadedBatches,
            );

            state.originalLazyGroupData.delete(dataKeys);

            dataSourceActions.originalLazyGroupDataChangeDetect =
              getChangeDetect();
          }
        }
      }
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
    toggleGroupRowSelection(groupKeys: string[]) {
      const { selectionMode } = getDataSourceState();

      if (selectionMode === 'multi-row') {
        if (this.isGroupRowSelected(groupKeys)) {
          this.deselectGroupRow(groupKeys);
        } else {
          this.selectGroupRow(groupKeys);
        }

        return true;
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
