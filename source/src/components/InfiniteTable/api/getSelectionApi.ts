import {
  getGroupKeysForDataItem,
  InfiniteTable_RowInfoBase,
} from '../../../utils/groupAndPivot';
import {
  DataSourceComponentActions,
  DataSourceState,
  RowSelectionState,
} from '../../DataSource';
import {
  GetRowSelectionStateConfig,
  RowSelectionStateObject,
} from '../../DataSource/RowSelectionState';

type ArrayOfIds = Pick<InfiniteTable_RowInfoBase<any>, 'id'>[];

export type InfiniteTableSelectionApi = {
  get allRowsSelected(): boolean;
  isRowSelected(pk: any, groupKeys?: any[]): boolean;
  isRowDeselected(pk: any, groupKeys?: any[]): boolean;

  selectRow(pk: any, groupKeys?: any[]): void;
  deselectRow(pk: any, groupKeys?: any[]): void;
  toggleRowSelection(pk: any, groupKeys?: any[]): void;

  selectGroupRow(groupKeys: any[], children?: ArrayOfIds): void;
  deselectGroupRow(groupKeys: any[], children?: ArrayOfIds): void;
  toggleGroupRowSelection(groupKeys: any[], children?: ArrayOfIds): void;

  getGroupRowSelectionState(groupKeys: any[]): boolean | null;

  getSelectedPrimaryKeys(
    rowSelection?: RowSelectionStateObject,
  ): (string | number)[];
  selectAll(): void;
  deselectAll(): void;
};

export type GetSelectionApiParam<T> = {
  getDataSourceState: () => DataSourceState<T>;
  dataSourceActions: {
    rowSelection: DataSourceComponentActions<T>['rowSelection'];
  };
};

export function rowSelectionStateConfigGetter<T>(
  stateOrStateGetter: DataSourceState<T> | (() => DataSourceState<T>),
): GetRowSelectionStateConfig<T> {
  return () => {
    const state =
      typeof stateOrStateGetter === 'function'
        ? stateOrStateGetter()
        : stateOrStateGetter;

    return {
      lazyLoad: !!state.lazyLoad,
      groupBy: state.groupBy,
      groupDeepMap: state.groupDeepMap,
      indexer: state.indexer,
      totalCount: state.unfilteredCount,
    };
  };
}

export function getSelectionApi<T>(
  param: GetSelectionApiParam<T>,
): InfiniteTableSelectionApi {
  const {
    // getComputed,
    // getState,
    getDataSourceState,
    // componentActions,
    dataSourceActions,
  } = param;

  const selectionApi = {
    get allRowsSelected() {
      return getDataSourceState().allRowsSelected;
    },

    // getSelectedRowCount() {
    //   const { selectionMode, selectedRowCount } = getDataSourceState();
    //   if (selectionMode != 'multi-row') {
    //     throw `Cannot get the selected row count unless "selectionMode" is "multi-row"!`;
    //   }
    //   return selectedRowCount;
    // },

    selectAll() {
      const { rowSelection, selectionMode } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row';
      }
      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection as RowSelectionState<string>,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.selectAll();

      dataSourceActions.rowSelection = rowSelectionState;
    },

    deselectAll() {
      const { rowSelection, selectionMode } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row';
      }
      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection as RowSelectionState<string>,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.deselectAll();

      dataSourceActions.rowSelection = rowSelectionState;
    },
    isRowSelected(pk: any, groupKeys?: any[]) {
      const { rowSelection, selectionMode, indexer, groupBy } =
        getDataSourceState();

      if (selectionMode === 'single-row') {
        return rowSelection === pk;
      }

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row or single-row';
      }
      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }
      if (!groupKeys) {
        const data = indexer.getDataForPrimaryKey(pk);
        groupKeys = data ? getGroupKeysForDataItem(data, groupBy) : [];
      }

      return rowSelection.isRowSelected(pk, groupKeys);
    },

    isRowDeselected(pk: any, groupKeys?: any[]) {
      return !this.isRowSelected(pk, groupKeys);
    },

    selectRow(pk: any, groupKeys?: any[]) {
      const { rowSelection, selectionMode, indexer, groupBy } =
        getDataSourceState();

      if (selectionMode === 'single-row') {
        dataSourceActions.rowSelection = pk;
        return;
      }

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row or single-row';
      }
      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      if (!groupKeys) {
        const data = indexer.getDataForPrimaryKey(pk);
        groupKeys = data ? getGroupKeysForDataItem(data, groupBy) : [];
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.selectRow(pk, groupKeys);
      dataSourceActions.rowSelection = rowSelectionState;
    },

    deselectRow(pk: any, groupKeys?: any[]) {
      const { selectionMode, rowSelection, indexer, groupBy } =
        getDataSourceState();

      if (selectionMode === 'single-row') {
        dataSourceActions.rowSelection = null;
        return;
      }

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode is not multi-row or single-row';
      }
      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      if (selectionMode === 'multi-row') {
        if (!groupKeys) {
          const data = indexer.getDataForPrimaryKey(pk);
          groupKeys = data ? getGroupKeysForDataItem(data, groupBy) : [];
        }

        const rowSelectionState = new RowSelectionState(
          rowSelection,
          rowSelectionStateConfigGetter(getDataSourceState),
        );

        rowSelectionState.deselectRow(pk, groupKeys);

        dataSourceActions.rowSelection = rowSelectionState;
      }
    },
    toggleRowSelection(pk: any, groupKeys?: any[]) {
      if (this.isRowSelected(pk, groupKeys)) {
        this.deselectRow(pk, groupKeys);
      } else {
        this.selectRow(pk, groupKeys);
      }
    },

    selectGroupRow(groupKeys: any[]) {
      const { selectionMode, rowSelection, groupBy } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode should be "multi-row"';
      }
      if (!groupBy) {
        throw 'No grouping specified';
      }

      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.selectGroupRow(groupKeys);

      dataSourceActions.rowSelection = rowSelectionState;
    },

    deselectGroupRow(groupKeys: any[]) {
      const { selectionMode, rowSelection, groupBy } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode should be "multi-row"';
      }
      if (!groupBy) {
        throw 'No grouping specified';
      }

      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.deselectGroupRow(groupKeys);

      dataSourceActions.rowSelection = rowSelectionState;
    },

    toggleGroupRowSelection(groupKeys: any[]) {
      const { selectionMode, rowSelection, groupBy } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode should be "multi-row"';
      }
      if (!groupBy) {
        throw 'No grouping specified';
      }

      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      const rowSelectionState = new RowSelectionState(
        rowSelection,
        rowSelectionStateConfigGetter(getDataSourceState),
      );

      rowSelectionState.toggleGroupRowSelection(groupKeys);

      dataSourceActions.rowSelection = rowSelectionState;
    },

    getGroupRowSelectionState(groupKeys: any[]) {
      const { selectionMode, rowSelection, groupBy } = getDataSourceState();

      if (selectionMode !== 'multi-row') {
        throw 'Selection mode should be "multi-row"';
      }
      if (!groupBy) {
        throw 'No grouping specified';
      }

      if (!(rowSelection instanceof RowSelectionState)) {
        throw 'Invalid row selection';
      }

      return rowSelection.getGroupRowSelectionState(groupKeys);
    },

    getSelectedPrimaryKeys: (rowSelection?: RowSelectionStateObject) => {
      const state = getDataSourceState();
      const rowSelectionState = rowSelection
        ? new RowSelectionState(
            rowSelection,
            rowSelectionStateConfigGetter(state),
          )
        : (state.rowSelection as RowSelectionState);

      const selected: (string | number)[] = [];

      if (state.lazyLoad) {
        console.error(
          `getSelectedPrimaryKeys  should not be called for lazy-loaded datasources as it wont return reliable results`,
        );
      }

      // we can't iterate over state.dataArray as that has collapsed rows
      // and wont reflect all the rows in the dataset
      state.originalDataArray.forEach((data) => {
        const id = state.toPrimaryKey(data);
        if (rowSelectionState.isRowSelected(id)) {
          selected.push(id);
        }
      });

      return selected;
    },
  };

  if (__DEV__) {
    (globalThis as any).selectionApi = selectionApi;
  }
  return selectionApi;
}
