import { DeepMap } from '../../../utils/DeepMap';
import { LAZY_ROOT_KEY_FOR_GROUPS } from '../../../utils/groupAndPivot';
import { SortDir } from '../../../utils/multisort';
import { GroupBy } from '../../../utils/groupAndPivot/types';

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
  MultiSortBehaviorOptions,
  ScrollAdjustPosition,
} from '../types/InfiniteTableProps';
import { getColumnApiForColumn } from './getColumnApi';
import {
  getRowSelectionApi,
  InfiniteTableRowSelectionApi,
} from './getRowSelectionApi';
import { realignColumnContextMenu } from './realignColumnContextMenu';

import { GetImperativeApiParam } from './type';
import { notNullable } from '../types/Utility';
import { UNKNOWN_SORT_TYPE } from '../utils/getComputedColumns';
import {
  getCellSelectionApi,
  InfiniteTableCellSelectionApi,
} from './getCellSelectionApi';

function isSortInfoForColumn<T>(
  sortInfo: DataSourceSingleSortInfo<T>,
  col: { id: string; field?: string | number },
) {
  if (sortInfo.id) {
    if (sortInfo.id === col.id) {
      return true;
    }
    return false;
  }
  if (sortInfo.field) {
    if (sortInfo.field === col.field) {
      return true;
    }
  }

  return false;
}

class InfiniteTableApiImpl<T> implements InfiniteTableApi<T> {
  private context: GetImperativeApiParam<T>;
  public rowSelectionApi: InfiniteTableRowSelectionApi;
  public cellSelectionApi: InfiniteTableCellSelectionApi<T>;

  constructor(context: GetImperativeApiParam<T>) {
    this.context = context;
    this.rowSelectionApi = getRowSelectionApi({
      dataSourceActions: context.dataSourceActions,
      getDataSourceState: context.getDataSourceState,
    });
    this.cellSelectionApi = getCellSelectionApi({
      dataSourceActions: context.dataSourceActions,
      getDataSourceState: context.getDataSourceState,
      getComputed: context.getComputed,
    });
  }

  get actions() {
    return this.context.actions;
  }

  get dataSourceActions() {
    return this.context.dataSourceActions;
  }

  get dataSourceApi() {
    return this.context.dataSourceApi;
  }

  focus() {
    this.getState().scrollerDOMRef.current?.focus();
  }

  hideContextMenu() {
    this.actions.contextMenuVisibleFor = null;
    this.actions.cellContextMenuVisibleFor = null;
  }

  hideFilterOperatorMenu = () => {
    this.actions.filterOperatorMenuVisibleForColumnId = null;
  };

  realignColumnContextMenu(callback?: VoidFunction) {
    const param = {
      actions: this.actions,
      getState: this.getState,
      getComputed: this.getComputed,
    };

    const delay = this.getState().columnMenuRealignDelay;

    if (!delay || delay < 0) {
      realignColumnContextMenu(param);
      callback?.();
    }
    setTimeout(() => {
      if (this.isDestroyed()) {
        return;
      }
      realignColumnContextMenu(param);
      callback?.();
    }, delay);
  }

  isDestroyed() {
    return !this.getState().domRef.current;
  }

  getColumnOrder = () => {
    return this.getComputed().computedColumnOrder;
  };

  getComputedColumnById = (columnId: string) => {
    return this.getComputed().computedColumnsMap.get(columnId);
  };

  getVisibleColumnOrder = () => {
    const order = this.getColumnOrder();

    const visibleColumns = this.getComputed().computedVisibleColumnsMap;

    return order.filter((id) => visibleColumns.has(id));
  };

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
    editingCell.value = valueToPersist;

    const persistEdit =
      this.getState().persistEdit ??
      (() => {
        if (!params.column.field) {
          return value;
        }
        const primaryKey = this.getDataSourceState().primaryKey;
        // TODO important see #introduce-primaryKey-field-even-with-primaryKeyFn

        const newData =
          params.data && typeof primaryKey === 'string'
            ? ({
                [primaryKey]: params.data[primaryKey],
                [params.column.field]: valueToPersist,
              } as Partial<T>)
            : {
                // #introduce-primaryKey-field-even-with-primaryKeyFn
                // when we don't have a primaryKey as field, we need to spread everything, until
                // we'll have `primaryKeyField`
                ...params.data,
                [params.column.field]: valueToPersist,
              };

        return this.context.dataSourceApi.updateData(newData);
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

    if (!column || !column.computedEditable || column.groupByForColumn) {
      return Promise.resolve(false);
    }

    const rowInfo = this.getDataSourceState().dataArray[rowIndex];

    if (!rowInfo || rowInfo.isGroupRow) {
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

  isColumnSortable = (columnId: string) => {
    return this.getColumnApi(columnId)?.isSortable() ?? false;
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
    const rowInfo = dataSourceApi.getRowInfoByIndex(rowIndex);
    const id = rowInfo?.id;

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

  collapseAllGroupRows = () => {
    const state = this.getDataSourceState();
    const newState = new GroupRowsState(state.groupRowsState);
    newState.collapseAll();

    this.dataSourceActions.groupRowsState = newState;
  };

  collapseGroupRow = (groupKeys: any[]) => {
    const state = this.getDataSourceState();
    if (state.groupRowsState.isGroupRowExpanded(groupKeys)) {
      this.toggleGroupRow(groupKeys);
      return true;
    }
    return false;
  };

  expandGroupRow = (groupKeys: any[]) => {
    const state = this.getDataSourceState();
    if (state.groupRowsState.isGroupRowCollapsed(groupKeys)) {
      this.toggleGroupRow(groupKeys);
      return true;
    }
    return false;
  };

  toggleGroupRow = (groupKeys: any[]) => {
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
  };

  toggleSortingForColumn = (
    columnId: string,
    options?: MultiSortBehaviorOptions,
  ) => {
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return;
    }

    let dir = this.getSortingForColumn(columnId);

    if (dir === null) {
      dir = 1;
    } else {
      dir = dir === 1 ? -1 : null;
    }

    this.setSortingForColumn(columnId, dir, options);
  };

  setSortingForColumn(
    columnId: string,
    dir: SortDir | null,
    options?: MultiSortBehaviorOptions,
  ) {
    const { computedColumnsMap } = this.getComputed();
    const c = computedColumnsMap.get(columnId);

    if (!c) {
      return;
    }

    const currentSorting = this.getSortingForColumn(columnId);

    if (currentSorting === dir) {
      if (this.getDataSourceState().multiSort === false) {
        // it's single sort
        // and the current sort is the same with the one we want to set
        // so we're good
        return;
      }

      // TODO low priority
      // when multi sort, we could do some checks in the future
      // and determine if we can bail out early
    }

    if (dir === null) {
      this.setSortInfoForColumn(columnId, null, options);
      return;
    }

    const groupByForColumn = c.groupByForColumn;

    let field: DataSourceSingleSortInfo<T>['field'] | undefined = c.field;

    const groupByForCol: GroupBy<T>[] = groupByForColumn
      ? Array.isArray(groupByForColumn)
        ? groupByForColumn
        : [groupByForColumn]
      : [];

    const fieldArr = groupByForCol
      .map((c) => {
        return c.valueGetter
          ? (item: T) => c.valueGetter({ data: item, field: c.field })
          : c.field
          ? (c.field as keyof T)
          : c.groupField ?? undefined;
      })
      .filter(notNullable);

    if (fieldArr.length) {
      field = fieldArr;
    }

    let computedSortType: string | string[] = c.computedSortType;

    if (groupByForCol.length && computedSortType === UNKNOWN_SORT_TYPE) {
      const sortTypeForGroupCols = groupByForCol.flatMap((groupBy) => {
        const field = groupBy.field ?? groupBy.groupField;

        const col = field ? computedColumnsMap.get(field as string) : null;
        if (!col) {
          return UNKNOWN_SORT_TYPE;
        }
        return col.computedSortType;
      });
      computedSortType = sortTypeForGroupCols;
    }

    const newColumnSortInfo: DataSourceSingleSortInfo<T> = {
      dir,
      id: c.id,
      field,
      type: computedSortType,
    };
    if (c.valueGetter) {
      newColumnSortInfo.valueGetter = (data) =>
        c.valueGetter!({ data, field: c.field });
    }

    this.setSortInfoForColumn(columnId, newColumnSortInfo, options);
  }

  setSortInfoForColumn(
    columnId: string,
    columnSortInfo: DataSourceSingleSortInfo<T> | null,
    options?: MultiSortBehaviorOptions,
  ) {
    const dataSourceState = this.getDataSourceState();
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return;
    }

    if (!dataSourceState.multiSort) {
      this.dataSourceApi.setSortInfo(columnSortInfo ? [columnSortInfo] : null);

      return;
    }

    const colField = col.field;
    const colInfo = {
      id: columnId,
      field: colField,
    };

    let newSortInfo = dataSourceState.sortInfo?.slice() ?? [];

    if (columnSortInfo === null) {
      // we need to filter out any existing sortInfo for this column
      newSortInfo = newSortInfo.filter(
        (sortInfo) => !isSortInfoForColumn(sortInfo, colInfo),
      );

      this.dataSourceApi.setSortInfo(newSortInfo);
      return;
    }

    let matched = false;

    const multiSortBehavior =
      options?.multiSortBehavior ?? this.getState().multiSortBehavior;

    if (multiSortBehavior === 'replace') {
      this.dataSourceApi.setSortInfo([columnSortInfo]);
      return;
    }

    newSortInfo = newSortInfo.map((sortInfo) => {
      if (matched) {
        return sortInfo;
      }
      if (isSortInfoForColumn(sortInfo, colInfo)) {
        matched = true;
        return columnSortInfo;
      }

      return sortInfo;
    });

    if (!matched) {
      newSortInfo.push(columnSortInfo);
    }

    this.dataSourceApi.setSortInfo(newSortInfo);
  }

  getSortTypeForColumn(columnId: string) {
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return null;
    }

    return col.computedSortType;
  }

  getSortInfoForColumn(columnId: string) {
    const col = this.getComputed().computedColumnsMap.get(columnId);

    if (!col) {
      return null;
    }

    return col.computedSortInfo;
  }

  getSortingForColumn(columnId: string) {
    const sortInfo = this.getSortInfoForColumn(columnId);

    if (!sortInfo) {
      return null;
    }

    return sortInfo.dir;
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
      }

      newFilterValueForColumn =
        filterValueForColumn as DataSourceFilterValueItem<T>;
    }

    newFilterValueForColumn.id = col.id;
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
    const filterTypeOperators = filterTypes[filterType].operators;
    const operator = (filterTypeOperators.find(
      (op) => op.name === newOperator,
    ) ??
      filterTypeOperators.find(
        (op) => op.name === filterTypes[filterType].defaultOperator,
      ))!;

    const operatorName = operator.name;

    let newFilterValueForColumn: DataSourceFilterValueItem<T>;
    if (col.computedFilterValue) {
      newFilterValueForColumn = {
        ...col.computedFilterValue,
        filter: {
          ...col.computedFilterValue.filter,
          operator: operatorName,
        },
      };
    } else {
      newFilterValueForColumn = {
        filter: {
          operator: operatorName,
          type: filterType,
          value:
            operator.defaultFilterValue !== undefined
              ? operator.defaultFilterValue
              : [...filterTypes[filterType].emptyValues.values()][0],
        },

        valueGetter: col.valueGetter,
      } as DataSourceFilterValueItem<T>;

      if (col.field) {
        newFilterValueForColumn.field = col.field;
      }
    }

    newFilterValueForColumn.id = col.id;

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
