import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { GroupRowsState } from '../../DataSource';
import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { loadData } from '../../DataSource/privateHooks/useLoadData';
import {
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
} from '../types';
import { ScrollAdjustPosition } from '../types/InfiniteTableProps';
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
