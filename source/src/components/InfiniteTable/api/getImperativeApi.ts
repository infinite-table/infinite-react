import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { SortDir } from '../../../utils/multisort';
import { DataSourceSingleSortInfo, GroupRowsState } from '../../DataSource';
import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { loadData } from '../../DataSource/privateHooks/useLoadData';
import {
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
} from '../types';
import {
  InfiniteTableColumnPinnedValues,
  ScrollAdjustPosition,
} from '../types/InfiniteTableProps';
import { getSelectionApi } from './getSelectionApi';

import { GetImperativeApiParam } from './type';

export function getImperativeApi<T>(param: GetImperativeApiParam<T>) {
  const {
    getComputed,
    getState,
    getDataSourceState,
    componentActions,
    dataSourceActions,
  } = param;

  const selectionApi = getSelectionApi({
    dataSourceActions,
    getDataSourceState,
  });
  const imperativeApi: InfiniteTableApi<T> = {
    get selectionApi() {
      return selectionApi;
    },

    setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => {
      componentActions.columnOrder = columnOrder;
    },

    collapseGroupRow(groupKeys: any[]) {
      const state = getDataSourceState();
      if (state.groupRowsState.isGroupRowExpanded(groupKeys)) {
        this.toggleGroupRow(groupKeys);
        return true;
      }
      return false;
    },

    expandGroupRow(groupKeys: any[]) {
      const state = getDataSourceState();
      if (state.groupRowsState.isGroupRowCollapsed(groupKeys)) {
        this.toggleGroupRow(groupKeys);
        return true;
      }
      return false;
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

    setSortingForColumn(columnId: string, dir: SortDir | null) {
      const col = getComputed().computedColumnsMap.get(columnId);

      if (!col) {
        return;
      }

      if (dir === null) {
        this.setSortInfoForColumn(columnId, null);
        return;
      }

      const sortInfo: DataSourceSingleSortInfo<T> = {
        dir,
      };

      const field = (col.groupByField ? col.groupByField : col.field) as
        | keyof T
        | (keyof T)[];

      if (field) {
        sortInfo.field = field;
      }
      if (col.computedSortType) {
        sortInfo.type = col.computedSortType;
      }

      if (col.valueGetter) {
        sortInfo.valueGetter = (data) =>
          col.valueGetter!({ data, field: col.field });
      }

      this.setSortInfoForColumn(columnId, sortInfo);
    },

    setPinningForColumn(
      columnId: string,
      pinning: InfiniteTableColumnPinnedValues,
    ) {
      const columnPinning = { ...getState().columnPinning };

      if (pinning === false) {
        delete columnPinning[columnId];
      } else {
        columnPinning[columnId] = pinning;
      }

      componentActions.columnPinning = columnPinning;
    },

    setSortInfoForColumn(
      columnId: string,
      columnSortInfo: DataSourceSingleSortInfo<T> | null,
    ) {
      const dataSourceState = getDataSourceState();
      const col = getComputed().computedColumnsMap.get(columnId);

      if (!col) {
        return;
      }

      if (!dataSourceState.multiSort) {
        dataSourceActions.sortInfo = columnSortInfo ? [columnSortInfo] : null;
        return;
      }

      const colField = col.field;

      let newSortInfo = dataSourceState.sortInfo?.slice() ?? [];

      if (columnSortInfo === null) {
        // we need to filter out any existing sortInfo for this column
        newSortInfo = newSortInfo.filter((sortInfo) => {
          if (sortInfo.id) {
            if (sortInfo.id === columnId) {
              return false;
            }
            return true;
          }
          if (sortInfo.field) {
            if (sortInfo.field === colField) {
              return false;
            }
            return true;
          }

          return true;
        });
        dataSourceActions.sortInfo = newSortInfo.length ? newSortInfo : null;
        return;
      }

      newSortInfo = newSortInfo.map((sortInfo) => {
        if (sortInfo.id) {
          if (sortInfo.id === columnId) {
            return columnSortInfo;
          }
          return sortInfo;
        }
        if (sortInfo.field) {
          if (sortInfo.field === colField) {
            return columnSortInfo;
          }
          return sortInfo;
        }

        return sortInfo;
      });
      dataSourceActions.sortInfo = newSortInfo.length ? newSortInfo : null;
    },

    setVisibilityForColumn(columnId: string, visible: boolean) {
      const columnVisibility = {
        ...getState().columnVisibility,
      };

      if (visible) {
        delete columnVisibility[columnId];
      } else {
        columnVisibility[columnId] = false;
      }
      componentActions.columnVisibility = columnVisibility;
    },

    getVisibleColumnsCount() {
      return getComputed().computedVisibleColumns.length;
    },

    setColumnVisibility(columnVisibility: InfiniteTablePropColumnVisibility) {
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
