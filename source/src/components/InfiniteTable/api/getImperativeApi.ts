import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { SortDir } from '../../../utils/multisort';
import {
  DataSourceFilterValueItem,
  DataSourceSingleSortInfo,
  GroupRowsState,
} from '../../DataSource';
import { getChangeDetect } from '../../DataSource/privateHooks/getChangeDetect';
import { loadData } from '../../DataSource/privateHooks/useLoadData';
import {
  getColumnValueToEdit,
  getCellContext,
  getFormattedValueContextForCell,
} from '../components/InfiniteTableRow/columnRendering';
import {
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnVisibility,
} from '../types';
import {
  InfiniteTableApiCellLocator,
  InfiniteTableApiIsCellEditableParams,
  InfiniteTableApiStopEditParams,
  InfiniteTableColumnApi,
  InfiniteTableColumnPinnedValues,
  ScrollAdjustPosition,
} from '../types/InfiniteTableProps';
import { getColumnApiForColumn } from './getColumnApi';
import { getSelectionApi, InfiniteTableSelectionApi } from './getSelectionApi';

import { GetImperativeApiParam } from './type';

class InfiniteTableApiImpl<T> implements InfiniteTableApi<T> {
  private context: GetImperativeApiParam<T>;
  public selectionApi: InfiniteTableSelectionApi;

  constructor(context: GetImperativeApiParam<T>) {
    this.context = context;
    this.selectionApi = getSelectionApi({
      dataSourceActions: context.dataSourceActions,
      getDataSourceState: context.getDataSourceState,
    });
  }

  get actions() {
    return this.context.actions;
  }

  get dataSourceActions() {
    return this.context.dataSourceActions;
  }

  focus() {
    this.getState().scrollerDOMRef.current?.focus();
  }

  persistEdit = async (arg?: { value?: any }): Promise<any | Error> => {
    arg = arg ?? {};

    const { editingCell, editingValueRef } = this.getState();

    if (!editingCell) {
      return Promise.resolve(new Error('no edit in progress'));
    }

    //await raf promise, so react can finish batching some state changes
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const column = this.getComputed().computedColumnsMap.get(
      editingCell.columnId,
    )!;

    const value = arg.value ?? editingCell.value;

    if (!editingCell.active && editingCell.waiting !== 'persist') {
      this.actions.editingCell = {
        ...editingCell,
        active: false,
        waiting: 'persist',
      };
    }

    const params = {
      ...getCellContext<T>({
        rowIndex: editingCell.rowIndex,
        columnId: editingCell.columnId,
        ...this.context,
        api: this,
      }),
      value,
      initialValue: editingCell.initialValue,
    };

    let valueToPersist = value;

    // clear value
    editingValueRef.current = null;

    if (column.getValueToPersist) {
      valueToPersist = await column.getValueToPersist(params);
    }

    params.value = valueToPersist;

    const persistEdit =
      this.getState().persistEdit ??
      (() => {
        if (!params.column.field) {
          return value;
        }
        return this.context.dataSourceApi.updateData({
          ...params.data,
          [params.column.field]: valueToPersist,
        });
      });

    let response;
    try {
      response = await persistEdit(params);
    } catch (err) {
      response = err;
    }

    const persisted = response instanceof Error ? response : true;

    this.actions.editingCell = {
      ...editingCell,
      active: false,
      accepted: false,
      waiting: false,
      persisted,
    };

    return Promise.resolve(persisted);
  };

  async startEdit(params: InfiniteTableApiCellLocator): Promise<boolean> {
    const { columnId, rowIndex: index, primaryKey } = params;

    const rowIndex =
      index ?? this.context.dataSourceApi.getIndexByPrimaryKey(primaryKey);

    return this.isCellEditable({
      rowIndex: rowIndex,
      columnId,
    }).then(async (editable) => {
      if (editable) {
        const dataArray = this.getDataSourceState().dataArray;

        const columnsMap = this.getComputed().computedColumnsMap;

        const column = columnsMap.get(columnId)!;
        const rowInfo = dataArray[rowIndex];

        let value = getColumnValueToEdit({
          column,
          rowInfo,
          // columnsMap,
          // fieldsToColumn,
          // context: {
          //   actions: this.actions,
          //   getState: this.getState,
          //   getDataSourceState: this.getDataSourceState,
          //   api: this,
          //   dataSourceApi: this.context.dataSourceApi,
          // },
        });

        const initialValue = value;

        if (column.getValueToEdit) {
          value = await column.getValueToEdit(
            getCellContext({
              ...this.context,
              rowIndex,
              columnId,
              api: this,
            }),
          );
        }

        this.actions.editingCell = {
          active: true,
          accepted: false,
          persisted: false,
          columnId,
          value,
          initialValue,
          rowIndex,
          primaryKey: dataArray[rowIndex]?.id,
        };
      }

      return editable;
    });
  }

  clearEditInfo = () => {
    this.actions.editingCell = null;
  };

  isEditInProgress = () => {
    const { editingCell } = this.getState();

    return editingCell ? editingCell.active : false;
  };

  isEditorVisibleForCell = (params: {
    rowIndex: number;
    columnId: string;
  }): boolean => {
    const { rowIndex, columnId } = params;
    const { dataArray } = this.getDataSourceState();

    const { editingCell } = this.getState();
    const rowInfo = dataArray[rowIndex];
    if (!rowInfo || !editingCell) {
      return false;
    }

    return (
      editingCell.columnId === columnId &&
      editingCell.primaryKey === rowInfo.id &&
      !!(editingCell.active || editingCell.waiting)
    );
  };

  confirmEdit = (value?: any) => {
    return this.stopEdit({ value });
  };

  stopEdit = async (
    params?: InfiniteTableApiStopEditParams,
  ): ReturnType<InfiniteTableApi<T>['stopEdit']> => {
    const state = this.getState();
    const { editingCell, editingValueRef } = state;
    if (!editingCell) {
      return true;
    }

    if (!params) {
      params = {};
    }

    const value = params.value ?? editingValueRef.current;

    if (!params.cancel && !params.reject) {
      // might be valid edit

      const { rowIndex, columnId } = editingCell!;

      this.actions.editingCell = {
        ...state.editingCell!,
        value,
        active: false,
        waiting: 'accept',
      };

      const { computedColumnsMap: columnsMap } = this.getComputed();

      const column = columnsMap.get(columnId);

      const shouldAcceptEdit =
        state.shouldAcceptEdit ?? column!.shouldAcceptEdit;

      // unless it's rejected at this stage
      let accept = shouldAcceptEdit
        ? shouldAcceptEdit({
            ...getCellContext({
              ...this.context,
              api: this,
              dataSourceApi: this.context.dataSourceApi,

              columnId,
              rowIndex,
            }),
            value,
            initialValue: editingCell!.initialValue,
          })
        : true;

      //await raf promise, so react can finish batching some state changes
      await new Promise((resolve) => requestAnimationFrame(resolve));

      return Promise.resolve(accept)
        .then((accepted) => {
          if (accepted === true) {
            this.actions.editingCell = {
              ...state.editingCell!,
              active: false,
              accepted: true,
              persisted: false,
              waiting: 'persist',
              value,
            };
            return true;
          }
          throw accepted;
        })
        .catch((err) => {
          if (!(err instanceof Error)) {
            err = new Error(`Edit rejected: ${err}`);
          }
          this.actions.editingCell = {
            ...editingCell!,
            value,
            persisted: false,
            active: false,
            waiting: false,
            accepted: err,
          };
          return { reject: err, value };
        });
    }

    if (params.cancel && editingCell?.active) {
      // cancelling the edit
      this.actions.editingCell = {
        ...editingCell!,
        active: false,
        cancelled: true,
        waiting: false,
        persisted: false,
      };

      return { cancel: true, value };
    }

    if (params.reject && editingCell?.active) {
      // rejecting an edit received via stopEdit({ reject: ... })
      this.actions.editingCell = {
        ...editingCell!,
        value,
        active: false,
        persisted: false,
        waiting: false,
        accepted: params.reject,
      };
      return { reject: params.reject, value };
    }

    return true;
  };

  cancelEdit = () => {
    return this.stopEdit({ cancel: true });
  };

  rejectEdit = (reason: Error) => {
    return this.stopEdit({ reject: reason });
  };

  isCellEditable = (params: InfiniteTableApiIsCellEditableParams) => {
    const { rowIndex: index, primaryKey, columnId } = params;

    const rowIndex =
      index ?? this.context.dataSourceApi.getIndexByPrimaryKey(primaryKey);

    const { computedColumnsMap: columnsMap } = this.getComputed();
    const column = columnsMap.get(columnId);

    if (!column || !column.computedEditable) {
      return Promise.resolve(false);
    }

    const rowInfo = this.getDataSourceState().dataArray[rowIndex];

    if (!rowInfo) {
      return Promise.resolve(false);
    }

    if (column.computedEditable === true) {
      return Promise.resolve(true);
    }

    const result = column.computedEditable(
      getCellContext({
        ...this.context,
        api: this,
        columnId,
        rowIndex,
      }),
    );

    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }

    return result;
  };

  getColumnApi = (
    columnIdOrIndex: string | number,
  ): InfiniteTableColumnApi<T> | null => {
    return getColumnApiForColumn(columnIdOrIndex, {
      ...this.context,
      api: this,
    });
  };

  getCellValue = (cellLocator: InfiniteTableApiCellLocator) => {
    return this.getCellValues(cellLocator)?.value ?? null;
  };
  getCellValues = (cellLocator: InfiniteTableApiCellLocator) => {
    const { rowIndex: index, primaryKey, columnId } = cellLocator;

    const { dataSourceApi } = this.context;
    const { computedColumnsMap } = this.getComputed();

    const rowIndex = index ?? dataSourceApi.getIndexByPrimaryKey(primaryKey);

    const column = computedColumnsMap.get(columnId);
    const id = dataSourceApi.getPrimaryKeyByIndex(rowIndex);
    const rowInfo = dataSourceApi.getRowInfoByIndex(id);

    if (!rowInfo || !column) {
      if (!column) {
        console.warn(`No column found with id: "${columnId}"`);
      }
      if (!rowInfo) {
        console.warn(
          `No row found with index: "${rowIndex}" or primary key: "${id}"`,
        );
      }
      return null;
    }

    const self = this as InfiniteTableApi<T>;
    const valueContext = getFormattedValueContextForCell({
      column,
      rowInfo,
      columnsMap: computedColumnsMap,
      context: { ...this.context, api: self },
    });
    return {
      value: valueContext.formattedValueContext.value,
      formattedValue: valueContext.formattedValue,
      rawValue: valueContext.formattedValueContext.rawValue,
    };
  };

  getVerticalRenderRange = () => {
    const range = this.getState().brain.getRenderRange();
    return {
      renderStartIndex: range.start[0],
      renderEndIndex: range.end[0],
    };
  };

  setColumnOrder = (columnOrder: InfiniteTablePropColumnOrder) => {
    this.actions.columnOrder = columnOrder;
  };

  collapseGroupRow(groupKeys: any[]) {
    const state = this.getDataSourceState();
    if (state.groupRowsState.isGroupRowExpanded(groupKeys)) {
      this.toggleGroupRow(groupKeys);
      return true;
    }
    return false;
  }

  expandGroupRow(groupKeys: any[]) {
    const state = this.getDataSourceState();
    if (state.groupRowsState.isGroupRowCollapsed(groupKeys)) {
      this.toggleGroupRow(groupKeys);
      return true;
    }
    return false;
  }

  toggleGroupRow(groupKeys: any[]) {
    const state = this.getDataSourceState();
    const newState = new GroupRowsState(state.groupRowsState);
    newState.toggleGroupRow(groupKeys);

    this.dataSourceActions.groupRowsState = newState;
    if (state.lazyLoad) {
      const dataKeys = [LAZY_ROOT_KEY_FOR_GROUPS, ...groupKeys];
      const currentData = state.originalLazyGroupData.get(dataKeys);

      if (newState.isGroupRowExpanded(groupKeys)) {
        if (!currentData?.cache) {
          loadData(state.data, state, this.dataSourceActions, {
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

          this.dataSourceActions.lazyLoadCacheOfLoadedBatches = DeepMap.clone(
            state.lazyLoadCacheOfLoadedBatches,
          );

          state.originalLazyGroupData.delete(dataKeys);

          this.dataSourceActions.originalLazyGroupDataChangeDetect =
            getChangeDetect();
        }
      }
    }
  }

  setSortingForColumn(columnId: string, dir: SortDir | null) {
    const col = this.getComputed().computedColumnsMap.get(columnId);

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

    const field = (col.groupByForColumn ? col.groupByForColumn : col.field) as
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
  }

  setPinningForColumn(
    columnId: string,
    pinning: InfiniteTableColumnPinnedValues,
  ) {
    const columnPinning = { ...this.getState().columnPinning };

    if (pinning === false) {
      delete columnPinning[columnId];
    } else {
      columnPinning[columnId] = pinning;
    }

    this.actions.columnPinning = columnPinning;
  }

  setColumnFilter(columnId: string, filterValue: any) {
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return;
    }

    const dataSourceState = this.getDataSourceState();
    const { filterTypes } = dataSourceState;

    let newFilterValueForColumn: DataSourceFilterValueItem<T>;
    if (col.computedFilterValue) {
      newFilterValueForColumn = {
        ...col.computedFilterValue,
        filter: {
          ...col.computedFilterValue.filter,
        },
      };
    } else {
      const filterType = col.computedFilterType;

      if (!filterTypes[filterType]) {
        return;
      }

      const filterValueForColumn: Partial<DataSourceFilterValueItem<T>> = {
        filter: {
          type: filterType,
          value: filterValue,
          operator: filterTypes[filterType].defaultOperator,
        },
        valueGetter: col.valueGetter,
      };

      if (col.field || typeof col.groupByForColumn === 'string') {
        //@ts-ignore
        filterValueForColumn.field = col.field! || col.groupByForColumn; // we also use `col.groupByForColumn`
        // in order to allow group columns (when groupRenderStrategy=single)
        // to have filters
      } else {
        //@ts-ignore
        filterValueForColumn.id = col.id;
      }

      newFilterValueForColumn =
        filterValueForColumn as DataSourceFilterValueItem<T>;
    }

    newFilterValueForColumn.filter.value = filterValue;

    this.setFilterValueForColumn(columnId, newFilterValueForColumn);
  }

  setColumnFilterOperator(columnId: string, newOperator: string) {
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return;
    }

    const dataSourceState = this.getDataSourceState();
    const { filterTypes } = dataSourceState;

    const filterType = col.computedFilterType;
    const operator =
      filterTypes[filterType].operators.find((op) => op.name === newOperator)
        ?.name ?? filterTypes[filterType].defaultOperator;

    let newFilterValueForColumn: DataSourceFilterValueItem<T>;
    if (col.computedFilterValue) {
      newFilterValueForColumn = {
        ...col.computedFilterValue,
        filter: {
          ...col.computedFilterValue.filter,
          operator,
        },
      };
    } else {
      newFilterValueForColumn = {
        filter: {
          operator,
          type: filterType,
          value: [...filterTypes[filterType].emptyValues.values()][0],
        },

        valueGetter: col.valueGetter,
      } as DataSourceFilterValueItem<T>;

      if (col.field) {
        newFilterValueForColumn.field = col.field;
      } else {
        newFilterValueForColumn.id = col.id;
      }
    }

    this.setFilterValueForColumn(columnId, newFilterValueForColumn);
  }

  setFilterValueForColumn(
    columnId: string,
    filterValue: DataSourceFilterValueItem<T>,
  ) {
    const column = this.getComputed().computedColumnsMap.get(columnId);

    if (!column) {
      return;
    }
    const state = this.getDataSourceState();

    let newFilterValue = state.filterValue ?? [];

    let found = false;
    newFilterValue = newFilterValue.map((currentFilterValue) => {
      if (currentFilterValue === column.computedFilterValue) {
        found = true;
        return filterValue;
      }
      // if (
      //   (filterValue.id && currentFilterValue.id === filterValue.id) ||
      //   (filterValue.field && currentFilterValue.field === column.field)
      // ) {
      //   found = true;
      //   return filterValue;
      // }

      return currentFilterValue;
    });

    if (!found) {
      newFilterValue.push(filterValue);
    }

    // we used to filter away the empty filter values
    // but we should not, as changing an operator should be reflected in the filter
    // even if the value is empty - for UI consistency

    // newFilterValue = newFilterValue.filter((filterValue) => {
    //   const filterType = filterTypes[filterValue.filterType];
    //   if (!filterType || filterType.emptyValues.has(filterValue.filterValue)) {
    //     return false;
    //   }
    //   return true;
    // });

    this.dataSourceActions.filterValue = newFilterValue;
  }

  clearColumnFilter(columnId: string) {
    const column = this.getComputed().computedColumnsMap.get(columnId);

    if (!column) {
      return;
    }

    const state = this.getDataSourceState();

    let newFilterValue = state.filterValue ?? [];
    let found = false;

    newFilterValue = newFilterValue.filter((currentFilterValue) => {
      if (currentFilterValue === column.computedFilterValue) {
        found = true;
        return false;
      }

      return true;
    });

    if (found) {
      this.dataSourceActions.filterValue = newFilterValue;
    }
  }

  setSortInfoForColumn(
    columnId: string,
    columnSortInfo: DataSourceSingleSortInfo<T> | null,
  ) {
    const dataSourceState = this.getDataSourceState();
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return;
    }

    if (!dataSourceState.multiSort) {
      this.dataSourceActions.sortInfo = columnSortInfo
        ? [columnSortInfo]
        : null;
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
      this.dataSourceActions.sortInfo = newSortInfo.length ? newSortInfo : null;
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
    this.dataSourceActions.sortInfo = newSortInfo.length ? newSortInfo : null;
  }

  setVisibilityForColumn(columnId: string, visible: boolean) {
    const columnVisibility = {
      ...this.getState().columnVisibility,
    };

    if (visible) {
      delete columnVisibility[columnId];
    } else {
      columnVisibility[columnId] = false;
    }
    this.actions.columnVisibility = columnVisibility;
  }

  getVisibleColumnsCount() {
    return this.getComputed().computedVisibleColumns.length;
  }

  setColumnVisibility(columnVisibility: InfiniteTablePropColumnVisibility) {
    this.actions.columnVisibility = columnVisibility;
  }
  getState = () => {
    return this.context.getState();
  };
  getComputed = () => {
    return this.context.getComputed();
  };
  getDataSourceState = () => this.context.getDataSourceState();

  get scrollLeft() {
    const state = this.getState();
    return state.brain.getScrollPosition().scrollLeft;
  }
  set scrollLeft(scrollLeft: number) {
    const state = this.getState();
    state.scrollerDOMRef.current!.scrollLeft = Math.max(scrollLeft, 0);
  }

  get scrollTop() {
    const state = this.getState();
    return state.brain.getScrollPosition().scrollTop;
  }
  set scrollTop(scrollTop: number) {
    const state = this.getState();
    state.scrollerDOMRef.current!.scrollTop = Math.max(scrollTop, 0);
  }
  scrollRowIntoView(
    rowIndex: number,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    } = { offset: 0 },
  ) {
    const state = this.getState();

    const scrollPosition = state.renderer.getScrollPositionForScrollRowIntoView(
      rowIndex,
      config,
    );

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
  }
  scrollColumnIntoView(
    columnId: string,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    } = { offset: 0 },
  ) {
    const state = this.getState();
    const computed = this.getComputed();

    const computedColumn = computed.computedVisibleColumnsMap.get(columnId);

    if (!computedColumn) {
      return false;
    }
    const colIndex = computedColumn.computedVisibleIndex;

    const scrollPosition =
      state.renderer.getScrollPositionForScrollColumnIntoView(colIndex, config);

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
  }

  scrollCellIntoView = (
    rowIndex: number,
    colIdOrIndex: string | number,
    config: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    } = { offset: 0 },
  ) => {
    const state = this.getState();
    const computed = this.getComputed();

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
      state.renderer.getScrollPositionForScrollColumnIntoView(colIndex, config);
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

    if (scrollLeftMax < 0 && scrollTopMax < 0) {
      // no scrollbars, so it's already in viewport
      // we can safely return true
      return true;
    }

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
  };
}

export function getImperativeApi<T>(context: GetImperativeApiParam<T>) {
  // const {
  //   getComputed,
  //   getState,
  //   getDataSourceState,
  //   actions: actions,
  //   dataSourceActions,
  // } = context;

  const api = new InfiniteTableApiImpl<T>(context);

  if (__DEV__) {
    (globalThis as any).imperativeApi = api;
  }

  return api;
}
