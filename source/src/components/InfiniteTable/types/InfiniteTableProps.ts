import * as React from 'react';
import type { KeyboardEvent } from 'react';

import {
  AggregationReducer,
  InfiniteTableRowInfoDataDiscriminator,
  InfiniteTablePropRepeatWrappedGroupRows,
} from '../../../utils/groupAndPivot';
import {
  DataSourceApi,
  DataSourceFilterValueItem,
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropGroupBy,
  DataSourcePropPivotBy,
  RowDetailStateObject,
  DataSourceProps,
  DataSourcePropSelectionMode,
  DataSourceSingleSortInfo,
  DataSourceState,
} from '../../DataSource/types';
import { Renderable } from '../../types/Renderable';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnEditableFn,
  InfiniteTableColumnRenderFunction,
  InfiniteTableColumnRenderFunctionForGroupRows,
  InfiniteTableColumnSortable,
  InfiniteTableComputedColumn,
  InfiniteTableComputedPivotFinalColumn,
  InfiniteTableDataTypeNames,
  InfiniteTablePivotColumn,
  InfiniteTablePivotFinalColumn,
} from './InfiniteTableColumn';
import {
  InfiniteTableActions,
  InfiniteTablePropPivotGrandTotalColumnPosition,
  InfiniteTablePropPivotTotalColumnPosition,
} from './InfiniteTableState';

import { InfiniteTableRowInfo, InfiniteTableState } from '.';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteCheckBoxProps } from '../components/CheckBox';
import { InfiniteTableRowSelectionApi } from '../api/getRowSelectionApi';
import { MenuColumn, MenuProps } from '../../Menu/MenuProps';
import { SortDir } from '../../../utils/multisort';
import { KeyOfNoSymbol, XOR } from './Utility';

import {
  InfiniteTableEventHandlerContext,
  InfiniteTableKeyboardEventHandlerContext,
} from '../eventHandlers/eventHandlerTypes';
import { MenuIconProps } from '../components/icons/MenuIcon';
import {
  InfiniteTableCellContext,
  InfiniteTablePublicContext,
  InfiniteTableRowContext,
} from './InfiniteTableContextValue';
import { InfiniteTableCellSelectionApi } from '../api/getCellSelectionApi';
import { InfiniteTableKeyboardNavigationApi } from '../api/getKeyboardNavigationApi';
import { RowDetailState } from '../../DataSource/RowDetailState';
import { InfiniteTableRowDetailApi } from '../api/getRowDetailApi';
import { RowDetailCacheStorageForCurrentRow } from '../../DataSource/RowDetailCache';
import { RowDetailCacheEntry } from '../../DataSource/state/getInitialState';
import { Size } from '../../types/Size';
import { TableRenderRange } from '../../VirtualBrain/MatrixBrain';

export type LoadMaskProps = {
  visible: boolean;
  children: Renderable;
};

// export type TablePropColumnOrderItem = string | { id: string; visible: boolean };
export type InfiniteTablePropColumnOrderNormalized = string[];
export type InfiniteTablePropColumnOrder =
  | InfiniteTablePropColumnOrderNormalized
  | true;

export type InfiniteTablePropColumnVisibility = Record<string, false>;
export type InfiniteTablePropColumnGroupVisibility = Record<string, boolean>;

export type InfiniteTableColumnPinnedValues = false | 'start' | 'end';

export type InfiniteTablePropColumnPinning = Record<
  string,
  true | 'start' | 'end'
>;

export type InfiniteTableRowStylingFnParams<T> = {
  rowIndex: number;
  rowHasSelectedCells: boolean;
  visibleColumnIds: string[];
  allColumnIds: string[];
} & InfiniteTableRowInfoDataDiscriminator<T>;
export type InfiniteTableRowStyleFn<T> = (
  params: InfiniteTableRowStylingFnParams<T>,
) => undefined | React.CSSProperties;
export type InfiniteTableRowClassNameFn<T> = (
  params: InfiniteTableRowStylingFnParams<T>,
) => string | undefined;
export type InfiniteTableCellClassNameFn<T> =
  InfiniteTableColumn<T>['className'];
export type InfiniteTablePropRowStyle<T> =
  | React.CSSProperties
  | InfiniteTableRowStyleFn<T>;
export type InfiniteTablePropCellStyle<T> = InfiniteTableColumn<T>['style'];
export type InfiniteTablePropRowClassName<T> =
  | string
  | InfiniteTableRowClassNameFn<T>;
export type InfiniteTablePropCellClassName<T> =
  | string
  | InfiniteTableCellClassNameFn<T>;

export type InfiniteTableColumnAggregator<T, AggregationResultType> = Omit<
  AggregationReducer<T, AggregationResultType>,
  'getter' | 'id'
> & {
  getter?: AggregationReducer<T, AggregationResultType>['getter'];
  field?: keyof T;
};

export type InfiniteTableColumnType<T> = {
  minWidth?: number;
  maxWidth?: number;

  filterType?: string;
  sortType?: string;
  dataType?: InfiniteTableDataTypeNames;

  defaultWidth?: number;
  defaultFlex?: number;
  // TODO  also move this on the column
  defaultPinned?: InfiniteTableColumnPinnedValues;
  defaultHiddenWhenGroupedBy?: InfiniteTableColumn<T>['defaultHiddenWhenGroupedBy'];

  header?: InfiniteTableColumn<T>['header'];
  comparer?: InfiniteTableColumn<T>['comparer'];
  draggable?: InfiniteTableColumn<T>['defaultDraggable'];

  resizable?: InfiniteTableColumn<T>['resizable'];
  align?: InfiniteTableColumn<T>['align'];
  headerAlign?: InfiniteTableColumn<T>['headerAlign'];
  verticalAlign?: InfiniteTableColumn<T>['verticalAlign'];

  contentFocusable?: InfiniteTableColumn<T>['contentFocusable'];

  defaultSortable?: InfiniteTableColumn<T>['defaultSortable'];
  defaultEditable?: InfiniteTableColumn<T>['defaultEditable'];
  defaultFilterable?: InfiniteTableColumn<T>['defaultFilterable'];

  columnGroup?: string;

  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  field?: KeyOfNoSymbol<T>;

  components?: InfiniteTableColumn<T>['components'];
  renderMenuIcon?: InfiniteTableColumn<T>['renderMenuIcon'];
  renderSortIcon?: InfiniteTableColumn<T>['renderSortIcon'];
  renderRowDetailIcon?: InfiniteTableColumn<T>['renderRowDetailIcon'];
  renderSelectionCheckBox?: InfiniteTableColumn<T>['renderSelectionCheckBox'];
  renderHeaderSelectionCheckBox?: InfiniteTableColumn<T>['renderHeaderSelectionCheckBox'];
  renderValue?: InfiniteTableColumn<T>['renderValue'];
  render?: InfiniteTableColumn<T>['render'];
  valueGetter?: InfiniteTableColumn<T>['valueGetter'];
  valueFormatter?: InfiniteTableColumn<T>['valueFormatter'];
  getValueToEdit?: InfiniteTableColumn<T>['getValueToEdit'];
  getValueToPersist?: InfiniteTableColumn<T>['getValueToPersist'];
  shouldAcceptEdit?: InfiniteTableColumn<T>['shouldAcceptEdit'];
  style?: InfiniteTableColumn<T>['style'];
  headerStyle?: InfiniteTableColumn<T>['headerStyle'];
  headerClassName?: InfiniteTableColumn<T>['headerClassName'];
};
export type InfiniteTablePropColumnTypesMap<T> = Map<
  'default' | string,
  InfiniteTableColumnType<T>
>;
export type InfiniteTablePropColumnTypes<T> = Record<
  'default' | string,
  InfiniteTableColumnType<T>
>;

export type InfiniteTableColumnSizingOptions = {
  flex?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
};

export type InfiniteTablePropColumnSizing = Record<
  string,
  InfiniteTableColumnSizingOptions
>;

export type InfiniteTableStateGetter<T> = () => InfiniteTableState<T>;
export type InfiniteTableComputedValuesGetter<T> =
  () => InfiniteTableComputedValues<T>;
export type InfiniteTableActionsGetter<T> = () => InfiniteTableActions<T>;
export type DataSourceStateGetter<T> = () => DataSourceState<T>;

export type ColumnCellValues = {
  value: any;
  rawValue: any;
  formattedValue: any;
};
export type InfiniteTableColumnApi<_T> = {
  showContextMenu: (target: EventTarget | HTMLElement) => void;
  toggleContextMenu: (target: EventTarget | HTMLElement) => void;
  hideContextMenu: () => void;

  showFilterOperatorMenu: (target: EventTarget | HTMLElement) => void;
  toggleFilterOperatorMenu: (target: EventTarget | HTMLElement) => void;
  hideFilterOperatorMenu: () => void;

  isVisible: () => boolean;
  isSortable: () => boolean;

  getSortInfo: () => DataSourceSingleSortInfo<_T> | null;
  getSortDir(): SortDir | null;

  toggleSort: (options?: MultiSortBehaviorOptions) => void;
  clearSort: () => void;
  setSort: (sort: SortDir | null, options?: MultiSortBehaviorOptions) => void;

  setFilter: (value: any) => void;
  clearFilter: (value: any) => void;

  getCellValuesByPrimaryKey: (id: any) => null | ColumnCellValues;

  getCellValueByPrimaryKey: (id: any) => any | null;
};

export type InfiniteTableApiStartEditParams =
  InfiniteTableApiIsCellEditableParams & {
    value?: any;
  };

export type InfiniteTableApiStopEditParams =
  | {
      cancel: true;
      reject?: never;
      value?: never;
    }
  | {
      reject: Error;
      cancel?: never;
      value?: never;
    }
  | {
      value?: any;
      cancel?: never;
      reject?: never;
    };

export type InfiniteTableApiIsCellEditableParams = InfiniteTableApiCellLocator;
export type InfiniteTableApiCellLocator = {
  columnId: string;
} & XOR<{ rowIndex: number }, { primaryKey: any }>;

type InfiniteTableApiStopEditPromiseResolveType =
  | {
      cancel: true;
      value: null;
    }
  | { reject: Error; value: any }
  | boolean;

export type MultiSortBehaviorOptions = {
  multiSortBehavior?: InfiniteTablePropMultiSortBehavior;
};

export interface InfiniteTableApi<T> {
  get rowDetailApi(): InfiniteTableRowDetailApi;
  get rowSelectionApi(): InfiniteTableRowSelectionApi;
  get cellSelectionApi(): InfiniteTableCellSelectionApi<T>;
  get keyboardNavigationApi(): InfiniteTableKeyboardNavigationApi<T>;
  get scrollContainer(): HTMLElement;
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;

  isDestroyed: () => boolean;

  clearEditInfo: () => void;

  hideContextMenu: () => void;
  hideFilterOperatorMenu: () => void;

  realignColumnContextMenu: () => void;
  getColumnOrder: () => string[];
  getVisibleColumnOrder: () => string[];
  getComputedColumnById: (
    colId: string,
  ) => InfiniteTableComputedColumn<T> | undefined;

  isEditorVisibleForCell(params: {
    rowIndex: number;
    columnId: string;
  }): boolean;

  get scrollLeftMax(): number;
  get scrollLeft(): number;
  set scrollLeft(value: number);

  get scrollTopMax(): number;
  get scrollTop(): number;
  set scrollTop(value: number);

  isCellEditable: (
    params: InfiniteTableApiIsCellEditableParams,
  ) => Promise<boolean>;
  getColumnAtIndex: (index: number) => InfiniteTableComputedColumn<T> | null;
  startEdit: (params: InfiniteTableApiStartEditParams) => Promise<boolean>;
  stopEdit: (
    params?: InfiniteTableApiStopEditParams,
  ) => Promise<InfiniteTableApiStopEditPromiseResolveType>;
  persistEdit: (params?: { value?: any }) => Promise<true | Error>;
  rejectEdit: (
    error: Error,
  ) => Promise<InfiniteTableApiStopEditPromiseResolveType>;
  confirmEdit: (
    value?: any,
  ) => Promise<InfiniteTableApiStopEditPromiseResolveType>;
  cancelEdit: () => Promise<InfiniteTableApiStopEditPromiseResolveType>;
  isEditInProgress: () => boolean;

  getVerticalRenderRange: () => {
    renderStartIndex: number;
    renderEndIndex: number;
  };
  collapseAllGroupRows: () => void;
  toggleGroupRow: (groupKeys: any[]) => void;
  collapseGroupRow: (groupKeys: any[]) => boolean;
  expandGroupRow: (groupKeys: any[]) => boolean;

  setSortInfoForColumn: (
    columnId: string,
    sortInfo: DataSourceSingleSortInfo<T> | null,
  ) => void;

  getSortInfoForColumn: (
    columnId: string,
  ) => DataSourceSingleSortInfo<T> | null;
  getSortTypeForColumn: (columnId: string) => string | string[] | null;

  toggleSortingForColumn: (
    columnId: string,
    options?: MultiSortBehaviorOptions,
  ) => void;

  setColumnFilter: (columnId: string, filterValue: any) => void;
  setColumnFilterOperator: (columnId: string, operator: string) => void;
  /**
   * Clears the filter for the given column to a default value. The column will still have a
   * corresponding filterValue, though set to the empty filter value, so it's not considered filtered.
   */
  clearColumnFilter: (columnId: string) => void;
  /**
   * Removes the filter for the column altogether. The column will no longer have a corresponding entry in the filterValue prop.
   */
  removeColumnFilter: (columnId: string) => void;
  isColumnSortable: (columnId: string) => boolean;
  setFilterValueForColumn: (
    columnId: string,
    filterValue: DataSourceFilterValueItem<T>,
  ) => void;

  setPinningForColumn: (
    columnId: string,
    pinning: InfiniteTableColumnPinnedValues,
  ) => void;

  setSortingForColumn: (columnId: string, dir: SortDir | null) => void;
  getSortingForColumn: (columnId: string) => SortDir | null;

  getColumnApi: (columnId: string) => InfiniteTableColumnApi<T> | null;

  setVisibilityForColumn: (columnId: string, visible: boolean) => void;
  setVisibilityForColumnGroup: (
    columnGroupId: string,
    visible: boolean,
  ) => void;
  getVisibleColumnsCount: () => number;

  scrollRowIntoView: (
    rowIndex: number,
    config?: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    },
  ) => boolean;
  scrollColumnIntoView: (
    colId: string,
    config?: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    },
  ) => boolean;
  scrollCellIntoView: (
    rowIndex: number,
    colIdOrIndex: string | number,
    config?: {
      scrollAdjustPosition?: ScrollAdjustPosition;
      offset?: number;
    },
  ) => boolean;

  getCellValues: (
    cellLocator: InfiniteTableApiCellLocator,
  ) => ColumnCellValues | null;
  getCellValue: (cellLocator: InfiniteTableApiCellLocator) => any | null;

  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
  focus: () => void;
}
export type InfiniteTablePropVirtualizeColumns<T> =
  | boolean
  | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);

export type InfiniteTableInternalProps<T> = {
  rowHeight: number;
  ___t?: T;
};

export type InfiniteTablePropColumns<
  T,
  ColumnType = InfiniteTableColumn<T>,
> = Record<string, ColumnType>;

export type InfiniteTableColumns<T> = InfiniteTablePropColumns<T>;

export type InfiniteTablePropColumnGroups = Record<
  string,
  InfiniteTableColumnGroup
>;

/**
 * the keys is an array of strings: first string in the array is the column group id, next strings are the ids of all columns in the group
 * the value is the id of the column to leave as visible
 */
export type InfiniteTablePropCollapsedColumnGroupsMap = Map<string[], string>;
export type InfiniteTablePropCollapsedColumnGroups = Map<string[], string>;

export type InfiniteTableColumnGroupHeaderRenderParams = {
  columnGroup: InfiniteTableComputedColumnGroup;
  horizontalLayoutPageIndex: number | null;
};
export type InfiniteTableColumnGroupHeaderRenderFunction = (
  params: InfiniteTableColumnGroupHeaderRenderParams,
) => Renderable;

export type InfiniteTableColumnGroupStyleFunction = (
  params: InfiniteTableColumnGroupHeaderRenderParams,
) => React.CSSProperties;

export type InfiniteTableColumnGroup = {
  columnGroup?: string;
  header?: Renderable | InfiniteTableColumnGroupHeaderRenderFunction;
  style?: React.CSSProperties | InfiniteTableColumnGroupStyleFunction;
};
export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  id: string;
  groupOffset: number;
  computedWidth: number;
  uniqueGroupId: string[];
  columns: string[];
  depth: number;
};

export type InfiniteTableGroupColumnGetterOptions<T> = {
  groupIndexForColumn?: number;
  groupByForColumn?: DataSourceGroupBy<T>;
  selectionMode: DataSourcePropSelectionMode;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupCount: number;
  groupBy: DataSourceGroupBy<T>[];
  pivotBy?: DataSourcePivotBy<T>[];
  sortable?: boolean;
};

export type InfiniteTablePivotColumnGetterOptions<
  T,
  COL_TYPE = InfiniteTableColumn<T>,
> = {
  column: COL_TYPE;
  groupBy: DataSourcePropGroupBy<T>;
  pivotBy: DataSourcePropPivotBy<T>;
};

export type InfiniteTablePropGroupRenderStrategy =
  | 'single-column'
  | 'multi-column'
  | 'inline';
export type InfiniteTableGroupColumnBase<T> = Partial<
  InfiniteTableColumn<T>
> & {
  renderGroupIcon?: InfiniteTableColumnRenderFunctionForGroupRows<T>;
  id?: string;
};
export type InfiniteTablePivotColumnBase<T> = InfiniteTableColumn<T> & {
  renderValue?: InfiniteTableColumnRenderFunction<
    T,
    InfiniteTableComputedPivotFinalColumn<T>
  >;
  // id?: string;
};
export type InfiniteTablePropGroupColumn<T> =
  | InfiniteTableGroupColumnBase<T>
  | InfiniteTableGroupColumnFunction<T>;

export type InfiniteTableGroupColumnFunction<T> = (
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupKeys: any[]) => void,
) => Partial<InfiniteTableGroupColumnBase<T>>;
export type InfiniteTablePropPivotColumn<
  T,
  COL_TYPE = InfiniteTableColumn<T>,
> =
  | Partial<InfiniteTablePivotColumnBase<T>>
  | ((
      options: InfiniteTablePivotColumnGetterOptions<T, COL_TYPE>,
    ) => InfiniteTablePivotColumnBase<T>);

export type RowDetailComponentProps<T = any> = {
  rowInfo: InfiniteTableRowInfo<T>;
  cache: RowDetailCacheStorageForCurrentRow<RowDetailCacheEntry>;
};
export type InfiniteTablePropComponents<T = any> = {
  LoadMask?: (
    props: LoadMaskProps & { children?: React.ReactNode | undefined },
  ) => React.JSX.Element | null;
  CheckBox?: (props: InfiniteCheckBoxProps) => React.JSX.Element | null;
  Menu?: (
    props: MenuProps & { children?: React.ReactNode | undefined },
  ) => React.JSX.Element | null;
  MenuIcon?: (props: MenuIconProps) => React.JSX.Element | null;
  RowDetail?: (props: RowDetailComponentProps<T>) => React.JSX.Element | null;
};

export type ScrollStopInfo = {
  scrollTop: number;
  scrollLeft: number;
  viewportSize: Size;
  renderRange: TableRenderRange;
  firstVisibleRowIndex: number;
  lastVisibleRowIndex: number;
  firstVisibleColIndex: number;
  lastVisibleColIndex: number;
};

export type InfiniteTableRowInfoDataDiscriminatorWithColumn<T> = {
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
} & InfiniteTableRowInfoDataDiscriminator<T>;

export type InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T> = {
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
} & InfiniteTableRowInfoDataDiscriminatorWithColumn<T>;

export type InfiniteTablePropEditable<T> =
  | InfiniteTableColumnEditableFn<T>
  | undefined;
export type InfiniteTablePropSortable<T> =
  | InfiniteTableColumnSortable<T>
  | undefined;

export type InfiniteTablePropOnEditAcceptedParams<T> =
  InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T> & {
    initialValue: any;
  };

export type InfiniteTablePropOnEditCancelledParams<T> =
  InfiniteTablePropOnEditAcceptedParams<T>;

export type InfiniteTablePropOnEditRejectedParams<T> =
  InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T> & {
    initialValue: any;
    error: Error;
  };

export type InfiniteTablePropOnEditPersistParams<T> =
  InfiniteTablePropOnEditAcceptedParams<T>;

export type InfiniteTablePropMultiSortBehavior = 'append' | 'replace';
export type InfiniteTablePropKeyboardShorcut = {
  key: string | string[];
  when?: (
    context: InfiniteTableKeyboardEventHandlerContext<any>,
  ) => boolean | Promise<boolean>;
  handler: (
    context: InfiniteTableKeyboardEventHandlerContext<any>,
    event: KeyboardEvent,
  ) =>
    | void
    | {
        stopNext: boolean;
      }
    | Promise<any>;
};

export type InfiniteTablePropDebugMode = boolean;

export type InfiniteTablePropOnCellDoubleClickResult = Partial<{
  preventEdit: boolean;
}>;

export type InfiniteTablePropOnKeyDownResult = Partial<{
  preventEdit: boolean;
  preventEditStop: boolean;
  preventDefaultForTabKeyWhenEditing: boolean;
  preventSelection: boolean;
  preventNavigation: boolean;
}>;

export interface InfiniteTableProps<T> {
  debugId?: string;
  columns: InfiniteTablePropColumns<T>;
  pivotColumns?: InfiniteTablePropColumns<T, InfiniteTablePivotColumn<T>>;
  children?: React.JSX.Element | React.JSX.Element[] | React.ReactNode;

  loadingText?: Renderable;
  components?: InfiniteTablePropComponents<T>;

  wrapRowsHorizontally?: boolean;

  debugMode?: InfiniteTablePropDebugMode;

  keyboardShortcuts?: InfiniteTablePropKeyboardShorcut[];

  repeatWrappedGroupRows?: InfiniteTablePropRepeatWrappedGroupRows<T>;

  viewportReservedWidth?: number;
  onViewportReservedWidthChange?: (viewportReservedWidth: number) => void;

  showColumnFilters?: boolean;

  pivotColumn?: InfiniteTablePropPivotColumn<
    T,
    InfiniteTableColumn<T> & InfiniteTablePivotFinalColumn<T>
  >;

  columnDefaultFilterable?: boolean;
  columnDefaultEditable?: boolean;

  /**
   * Default behavior for column sorting. Defaults to true.
   *
   * This is overriden by all other props that can control sorting behavior (`column.defaultSortable`, `columnType.defaultSortable`, `sortable`).
   */
  columnDefaultSortable?: boolean;

  /**
   * This overrides both the global `columnDefaultSortable` prop and the column's own `defaultSortable` prop.
   * When used, it's the ultimate source of truth for whether (and which) columns are sortable.
   */
  sortable?: InfiniteTablePropSortable<T>;

  /**
   * This overrides both the global `columnDefaultEditable` prop and the column's own `defaultEditable` prop.
   */
  editable?: InfiniteTablePropEditable<T>;

  pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;
  pivotGrandTotalColumnPosition?: InfiniteTablePropPivotGrandTotalColumnPosition;

  groupColumn?: InfiniteTablePropGroupColumn<T>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
  hideEmptyGroupColumns?: boolean;

  columnVisibility?: InfiniteTablePropColumnVisibility;
  columnGroupVisibility?: InfiniteTablePropColumnGroupVisibility;
  defaultColumnGroupVisibility?: InfiniteTablePropColumnGroupVisibility;

  defaultColumnVisibility?: InfiniteTablePropColumnVisibility;

  pinnedStartMaxWidth?: number;
  pinnedEndMaxWidth?: number;

  shouldAcceptEdit?: InfiniteTableColumn<T>['shouldAcceptEdit'];

  onEditCancelled?: (params: InfiniteTablePropOnEditCancelledParams<T>) => void;

  onEditAccepted?: (params: InfiniteTablePropOnEditAcceptedParams<T>) => void;

  onEditRejected?: (params: InfiniteTablePropOnEditRejectedParams<T>) => void;

  persistEdit?: (
    params: InfiniteTablePropOnEditPersistParams<T>,
  ) => any | Error | Promise<any | Error>;

  onEditPersistSuccess?: (
    params: InfiniteTablePropOnEditPersistParams<T>,
  ) => void;
  onEditPersistError?: (
    params: InfiniteTablePropOnEditPersistParams<T> & { error: Error },
  ) => void;

  // filterableColumns?: Record<string, boolean>;

  columnPinning?: InfiniteTablePropColumnPinning;
  defaultColumnPinning?: InfiniteTablePropColumnPinning;
  onColumnPinningChange?: (
    columnPinning: InfiniteTablePropColumnPinning,
  ) => void;

  columnSizing?: InfiniteTablePropColumnSizing;
  defaultColumnSizing?: InfiniteTablePropColumnSizing;
  onColumnSizingChange?: (columnSizing: InfiniteTablePropColumnSizing) => void;

  pivotColumnGroups?: InfiniteTablePropColumnGroups;
  columnGroups?: InfiniteTablePropColumnGroups;
  defaultColumnGroups?: InfiniteTablePropColumnGroups;

  defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
  collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;

  onScrollbarsChange?: (scrollbars: Scrollbars) => void;

  // TODO P1 clarify columnVisibility as object only!
  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;

  onColumnGroupVisibilityChange?: (
    columnGroupVisibility: InfiniteTablePropColumnGroupVisibility,
  ) => void;
  columnTypes?: InfiniteTablePropColumnTypes<T>;
  // columnVisibilityAssumeVisible?: boolean;

  showSeparatePivotColumnForSingleAggregation?: boolean;

  isRowDetailExpanded?: (rowInfo: InfiniteTableRowInfo<T>) => boolean;
  isRowDetailEnabled?: (rowInfo: InfiniteTableRowInfo<T>) => boolean;

  rowDetailCache?: boolean | number;
  rowDetailState?: RowDetailState | RowDetailStateObject<any>;
  defaultRowDetailState?: RowDetailState | RowDetailStateObject<any>;
  onRowDetailStateChange?: (
    rowDetailState: RowDetailState,
    {
      expandRow,
      collapseRow,
    }: { expandRow: any | null; collapseRow: any | null },
  ) => void;

  // TODO implement this - see collapseGroupRowsOnDataFunctionChange for details
  // collapseRowDetailsOnDataFunctionChange?: boolean;

  rowHeight?: number | string | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  rowDetailHeight?:
    | number
    | string
    | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  // TODO implement #rowDetailWidth with options for min/max/actual viewport width
  rowDetailRenderer?: (
    rowInfo: InfiniteTableRowInfo<T>,
    cache: RowDetailCacheStorageForCurrentRow<RowDetailCacheEntry>,
  ) => Renderable;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  columnHeaderHeight?: number | string;

  onKeyDown?: (
    context: InfiniteTablePublicContext<T> & {
      actions: InfiniteTableEventHandlerContext<T>['actions'];
    },
    event: React.KeyboardEvent,
  ) => void | InfiniteTablePropOnKeyDownResult;

  onCellClick?: (
    context: InfiniteTablePublicContext<T> & InfiniteTableCellContext<T>,
    event: React.MouseEvent,
  ) => void;

  onCellDoubleClick?: (
    context: InfiniteTablePublicContext<T> & InfiniteTableCellContext<T>,
    event: React.MouseEvent,
  ) => void | InfiniteTablePropOnCellDoubleClickResult;

  onContextMenu?: (
    context: InfiniteTablePublicContext<T> & {
      event: React.MouseEvent;
    } & Partial<InfiniteTableRowInfoDataDiscriminatorWithColumn<T>>,
    event: React.MouseEvent,
  ) => void;

  onCellContextMenu?: (
    context: InfiniteTablePublicContext<T> &
      InfiniteTableRowInfoDataDiscriminatorWithColumn<T> & {
        event: React.MouseEvent;
      },
    event: React.MouseEvent,
  ) => void;

  /**
   * Properties to be sent directly to the DOM element underlying InfiniteTable.
   *
   * Useful for passing a className or style and any other event handlers. For more context
   * on some event handlers (eg: onKeyDown), you might want to use dedicated props that give you access
   * to component state as well.
   */
  domProps?: React.HTMLProps<HTMLDivElement>;
  /**
   * A unique identifier for the table instance. Will not be passed to the DOM.
   */
  id?: string;
  showZebraRows?: boolean;
  showHoverRows?: boolean;

  multiSortBehavior?: InfiniteTablePropMultiSortBehavior;

  keyboardNavigation?: InfiniteTablePropKeyboardNavigation;
  keyboardSelection?: InfiniteTablePropKeyboardSelection;
  defaultActiveRowIndex?: number | null;
  activeRowIndex?: number | null;
  onActiveRowIndexChange?: (activeRowIndex: number) => void;
  onActiveCellIndexChange?: (activeCellIndex: [number, number]) => void;
  activeCellIndex?: [number, number] | null;
  defaultActiveCellIndex?: [number, number] | null;
  /**
   * Whether the columns are draggable by default.
   *
   * This is the prop that has the lowest priority - it's overridden by column.defaultDraggable and ultimately by draggableColumns
   */
  columnDefaultDraggable?: boolean;
  /**
   * Whether the columns are draggable by default.
   *
   * This is the prop that has the highest priority - overrides columnDefaultDraggable and column.defaultDraggable
   */
  draggableColumns?: boolean;
  draggableColumnsRestrictTo?: false | 'group';
  header?: boolean;
  headerOptions?: InfiniteTablePropHeaderOptions;
  focusedClassName?: string;
  focusedWithinClassName?: string;
  focusedStyle?: React.CSSProperties;
  focusedWithinStyle?: React.CSSProperties;
  columnCssEllipsis?: boolean;
  columnHeaderCssEllipsis?: boolean;
  columnDefaultWidth?: number;
  columnDefaultFlex?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;

  hideColumnWhenGrouped?: boolean;

  resizableColumns?: boolean;
  virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  onSelfFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onSelfBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocusWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;

  /**
   * When a column is hidden by using the column menu, the column menu will stay open,
   * so it needs (generally) to be realigned to the correct location. This prop
   * configures the delay in milliseconds before the column menu is realigned.
   *
   * @default 50
   */
  columnMenuRealignDelay?: number;

  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  scrollStopDelay?: number;
  onScrollStop?: (param: ScrollStopInfo) => void;
  scrollToBottomOffset?: number;

  onRenderRangeChange?: (range: TableRenderRange) => void;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (
    columnOrder: InfiniteTablePropColumnOrderNormalized,
  ) => void;
  onRowHeightChange?: (rowHeight: number) => void;

  onRowMouseEnter?: (
    context: InfiniteTableRowContext<T>,
    event: React.MouseEvent,
  ) => void;
  onRowMouseLeave?: (
    context: InfiniteTableRowContext<T>,
    event: React.MouseEvent,
  ) => void;

  onReady?: ({
    api,
    dataSourceApi,
  }: {
    api: InfiniteTableApi<T>;
    dataSourceApi: DataSourceApi<T>;
  }) => void;

  rowProps?:
    | React.HTMLProps<HTMLDivElement>
    | ((
        rowArgs: InfiniteTableRowStylingFnParams<T>,
      ) => React.HTMLProps<HTMLDivElement>);

  licenseKey?: string;

  scrollTopKey?: string | number;
  autoSizeColumnsKey?: InfiniteTablePropAutoSizeColumnsKey;

  getCellContextMenuItems?: InfiniteTablePropGetCellContextMenuItems<T>;
  getContextMenuItems?: InfiniteTablePropGetContextMenuItems<T>;

  getColumnMenuItems?: InfiniteTablePropGetColumnMenuItems<T>;
  getFilterOperatorMenuItems?: InfiniteTablePropGetFilterOperatorMenuItems<T>;
}

export type InfiniteTablePropGetColumnMenuItems<T> = (
  defaultItems: Exclude<MenuProps['items'], undefined>,
  params: {
    column: InfiniteTableComputedColumn<T>;
    columnApi: InfiniteTableColumnApi<T>;
    getComputed: () => InfiniteTableComputedValues<T>;
  } & InfiniteTablePublicContext<T>,
) => MenuProps['items'];

export type GetContextMenuItemsReturnType =
  | MenuProps['items']
  | null
  | {
      items: MenuProps['items'];
      columns: MenuColumn[];
    };
export type InfiniteTablePropGetCellContextMenuItems<T> = (
  info: InfiniteTableRowInfoDataDiscriminatorWithColumn<T> & {
    event: React.MouseEvent;
  },
  params: InfiniteTablePublicContext<T>,
) => Promise<GetContextMenuItemsReturnType> | GetContextMenuItemsReturnType;

export type InfiniteTablePropGetContextMenuItems<T> = (
  param: {
    event: React.MouseEvent;
  } & Partial<InfiniteTableRowInfoDataDiscriminatorWithColumn<T>>,
  params: InfiniteTablePublicContext<T>,
) => Promise<GetContextMenuItemsReturnType> | GetContextMenuItemsReturnType;

export type InfiniteTablePropGetFilterOperatorMenuItems<T> = (
  defaultItems: Exclude<MenuProps['items'], undefined>,
  params: {
    column: InfiniteTableComputedColumn<T>;
    filterTypes: DataSourceProps<T>['filterTypes'];
    columnFilterValue: DataSourceFilterValueItem<T> | null;
    api: InfiniteTableApi<T>;
    getState: () => InfiniteTableState<T>;
    getComputed: () => InfiniteTableComputedValues<T>;
    actions: InfiniteTableActions<T>;
  },
) => MenuProps['items'];

export type InfiniteTablePropKeyboardNavigation = 'cell' | 'row' | false;
export type InfiniteTablePropKeyboardSelection = boolean;

export type InfiniteTablePropHeaderOptions = {
  alwaysReserveSpaceForSortIcon: boolean;
};

export type InfiniteTablePropAutoSizeColumnsKey =
  | string
  | number
  | {
      key: string | number;
      columnsToSkip?: string[];
      columnsToResize?: string[];
      includeHeader?: boolean;
    };

export type Scrollbars = {
  vertical: boolean;
  horizontal: boolean;
};

export type ScrollAdjustPosition = 'start' | 'end' | 'center';

export type InfiniteColumnEditorContextType<T> = {
  api: InfiniteTableApi<T>;
  initialValue: any;
  value: any;
  readOnly: boolean;
  column: InfiniteTableComputedColumn<T>;
  rowInfo: InfiniteTableRowInfo<T>;
  setValue: (value: any) => void;
  confirmEdit: InfiniteTableApi<T>['confirmEdit'];
  cancelEdit: InfiniteTableApi<T>['cancelEdit'];
  rejectEdit: InfiniteTableApi<T>['rejectEdit'];
};
