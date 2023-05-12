import * as React from 'react';

import {
  AggregationReducer,
  InfiniteTableRowInfoDataDiscriminator,
} from '../../../utils/groupAndPivot';
import {
  DataSourceApi,
  DataSourceFilterValueItem,
  DataSourceGroupBy,
  DataSourcePivotBy,
  DataSourcePropGroupBy,
  DataSourcePropPivotBy,
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

import { InfiniteTableState } from '.';
import { InfiniteTableComputedValues } from './InfiniteTableComputedValues';
import { InfiniteCheckBoxProps } from '../components/CheckBox';
import { InfiniteTableSelectionApi } from '../api/getSelectionApi';
import { MenuColumn, MenuProps } from '../../Menu/MenuProps';
import { SortDir } from '../../../utils/multisort';
import { KeyOfNoSymbol, XOR } from './Utility';

import { InfiniteTableEventHandlerContext } from '../eventHandlers/eventHandlerTypes';
import { MenuIconProps } from '../components/icons/MenuIcon';
import {
  InfiniteTableCellContext,
  InfiniteTablePublicContext,
} from './InfiniteTableContextValue';

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

export type InfiniteTableColumnPinnedValues = false | 'start' | 'end';

export type InfiniteTablePropColumnPinning = Record<
  string,
  true | 'start' | 'end'
>;

export type InfiniteTableRowStyleFnParams<T> = {
  rowIndex: number;
} & InfiniteTableRowInfoDataDiscriminator<T>;
export type InfiniteTableRowStyleFn<T> = (
  params: InfiniteTableRowStyleFnParams<T>,
) => undefined | React.CSSProperties;
export type InfiniteTableRowClassNameFn<T> = (
  params: InfiniteTableRowStyleFnParams<T>,
) => string | undefined;
export type InfiniteTablePropRowStyle<T> =
  | React.CSSProperties
  | InfiniteTableRowStyleFn<T>;
export type InfiniteTablePropRowClassName<T> =
  | string
  | InfiniteTableRowClassNameFn<T>;

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
  draggable?: InfiniteTableColumn<T>['draggable'];
  sortable?: InfiniteTableColumn<T>['sortable'];
  resizable?: InfiniteTableColumn<T>['resizable'];
  align?: InfiniteTableColumn<T>['align'];
  verticalAlign?: InfiniteTableColumn<T>['verticalAlign'];

  contentFocusable?: InfiniteTableColumn<T>['contentFocusable'];
  defaultEditable?: InfiniteTableColumn<T>['defaultEditable'];
  defaultFilterable?: InfiniteTableColumn<T>['defaultFilterable'];

  columnGroup?: string;

  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  field?: KeyOfNoSymbol<T>;

  components?: InfiniteTableColumn<T>['components'];
  renderMenuIcon?: InfiniteTableColumn<T>['renderMenuIcon'];
  renderSortIcon?: InfiniteTableColumn<T>['renderSortIcon'];
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

  toggleSort: () => void;
  clearSort: () => void;
  setSort: (sort: SortDir | null) => void;
  setFilter: (value: any) => void;
  clearFilter: (value: any) => void;

  getCellValuesByPrimaryKey: (id: any) => null | ColumnCellValues;

  getCellValueByPrimaryKey: (id: any) => any | null;
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

export interface InfiniteTableApi<T> {
  get selectionApi(): InfiniteTableSelectionApi;
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;

  clearEditInfo: () => void;

  isEditorVisibleForCell(params: {
    rowIndex: number;
    columnId: string;
  }): boolean;

  get scrollLeft(): number;
  set scrollLeft(value: number);

  get scrollTop(): number;
  set scrollTop(value: number);

  isCellEditable: (
    params: InfiniteTableApiIsCellEditableParams,
  ) => Promise<boolean>;
  startEdit: (params: InfiniteTableApiIsCellEditableParams) => Promise<boolean>;
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
  toggleGroupRow: (groupKeys: any[]) => void;
  collapseGroupRow: (groupKeys: any[]) => boolean;
  expandGroupRow: (groupKeys: any[]) => boolean;

  setSortInfoForColumn: (
    columnId: string,
    sortInfo: DataSourceSingleSortInfo<T> | null,
  ) => void;

  setColumnFilter: (columnId: string, filterValue: any) => void;
  setColumnFilterOperator: (columnId: string, operator: string) => void;
  clearColumnFilter: (columnId: string) => void;
  setFilterValueForColumn: (
    columnId: string,
    filterValue: DataSourceFilterValueItem<T>,
  ) => void;

  setPinningForColumn: (
    columnId: string,
    pinning: InfiniteTableColumnPinnedValues,
  ) => void;

  setSortingForColumn: (columnId: string, dir: SortDir | null) => void;

  getColumnApi: (columnId: string) => InfiniteTableColumnApi<T> | null;

  setVisibilityForColumn: (columnId: string, visible: boolean) => void;
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

export type InfiniteTableColumnsMap<
  T,
  ColumnType = InfiniteTableColumn<T>,
> = Map<string, ColumnType>;

export type InfiniteTablePropColumns<T, ColumnType = InfiniteTableColumn<T>> =
  | Record<string, ColumnType>
  | InfiniteTableColumnsMap<T, ColumnType>;

export type InfiniteTableColumns<T> = InfiniteTablePropColumns<T>;

export type InfiniteTablePropColumnGroupsMap = Map<
  string,
  InfiniteTableColumnGroup
>;
export type InfiniteTablePropColumnGroupsRecord = Record<
  string,
  InfiniteTableColumnGroup
>;
export type InfiniteTablePropColumnGroups =
  | InfiniteTablePropColumnGroupsRecord
  | InfiniteTablePropColumnGroupsMap;

/**
 * the keys is an array of strings: first string in the array is the column group id, next strings are the ids of all columns in the group
 * the value is the id of the column to leave as visible
 */
export type InfiniteTablePropCollapsedColumnGroupsMap = Map<string[], string>;
export type InfiniteTablePropCollapsedColumnGroups = Map<string[], string>;

export type InfiniteTableColumnGroupHeaderRenderParams = {
  columnGroup: InfiniteTableComputedColumnGroup;
};
export type InfiniteTableColumnGroupHeaderRenderFunction = (
  params: InfiniteTableColumnGroupHeaderRenderParams,
) => Renderable;

export type InfiniteTableColumnGroup = {
  columnGroup?: string;
  header?: Renderable | InfiniteTableColumnGroupHeaderRenderFunction;
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

export type InfiniteTablePropComponents = {
  LoadMask?: (
    props: LoadMaskProps & { children?: React.ReactNode | undefined },
  ) => JSX.Element | null;
  CheckBox?: (props: InfiniteCheckBoxProps) => JSX.Element | null;
  Menu?: (
    props: MenuProps & { children?: React.ReactNode | undefined },
  ) => JSX.Element | null;
  MenuIcon?: (props: MenuIconProps) => JSX.Element | null;
};

export type ScrollStopInfo = {
  scrollTop: number;
  firstVisibleRowIndex: number;
  lastVisibleRowIndex: number;
};

export type InfiniteTableRowInfoDataDiscriminatorWithColumn<T> = {
  column: InfiniteTableComputedColumn<T>;
  columnApi: InfiniteTableColumnApi<T>;
} & InfiniteTableRowInfoDataDiscriminator<T>;

export type InfiniteTableRowInfoDataDiscriminatorWithColumnAndApis<T> = {
  api: InfiniteTableApi<T>;
  dataSourceApi: DataSourceApi<T>;
} & InfiniteTableRowInfoDataDiscriminatorWithColumn<T>;

export type InfiniteTablePropsEditable<T> =
  | InfiniteTableColumnEditableFn<T>
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

export interface InfiniteTableProps<T> {
  columns: InfiniteTablePropColumns<T>;
  pivotColumns?: InfiniteTableColumnsMap<T, InfiniteTablePivotColumn<T>>;

  loadingText?: Renderable;
  components?: InfiniteTablePropComponents;

  viewportReservedWidth?: number;
  onViewportReservedWidthChange?: (viewportReservedWidth: number) => void;

  showColumnFilters?: boolean;

  pivotColumn?: InfiniteTablePropPivotColumn<
    T,
    InfiniteTableColumn<T> & InfiniteTablePivotFinalColumn<T>
  >;

  columnDefaultFilterable?: boolean;
  columnDefaultEditable?: boolean;
  editable?: InfiniteTablePropsEditable<T>;

  pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;
  pivotGrandTotalColumnPosition?: InfiniteTablePropPivotGrandTotalColumnPosition;

  groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
  hideEmptyGroupColumns?: boolean;

  columnVisibility?: InfiniteTablePropColumnVisibility;

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

  columnSizing?: InfiniteTablePropColumnSizing;
  defaultColumnSizing?: InfiniteTablePropColumnSizing;
  onColumnSizingChange?: (columnSizing: InfiniteTablePropColumnSizing) => void;

  pivotColumnGroups?: InfiniteTablePropColumnGroups;
  columnGroups?: InfiniteTablePropColumnGroups;
  defaultColumnGroups?: InfiniteTablePropColumnGroups;

  defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
  collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;

  onScrollbarsChange?: (scrollbars: Scrollbars) => void;

  // TODO P1 clarify columnVisibility as object only
  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  columnTypes?: InfiniteTablePropColumnTypes<T>;
  // columnVisibilityAssumeVisible?: boolean;

  showSeparatePivotColumnForSingleAggregation?: boolean;

  rowHeight: number | string;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  columnHeaderHeight: number | string;

  onKeyDown?: (
    context: InfiniteTablePublicContext<T> & {
      actions: InfiniteTableEventHandlerContext<T>['actions'];
    },
    event: React.KeyboardEvent,
  ) => void;

  onCellClick?: (
    context: InfiniteTablePublicContext<T> & InfiniteTableCellContext<T>,
    event: React.MouseEvent,
  ) => void;

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
  sortable?: boolean;

  keyboardNavigation?: InfiniteTablePropKeyboardNavigation;
  keyboardSelection?: InfiniteTablePropKeyboardSelection;
  defaultActiveRowIndex?: number | null;
  activeRowIndex?: number | null;
  onActiveRowIndexChange?: (activeRowIndex: number) => void;
  onActiveCellIndexChange?: (activeCellIndex: [number, number]) => void;
  activeCellIndex?: [number, number] | null;
  defaultActiveCellIndex?: [number, number] | null;
  draggableColumns?: boolean;
  header?: boolean;
  headerOptions?: InfiniteTablePropHeaderOptions;
  focusedClassName?: string;
  focusedWithinClassName?: string;
  focusedStyle?: React.CSSProperties;
  focusedWithinStyle?: React.CSSProperties;
  columnCssEllipsis?: boolean;
  columnHeaderCssEllipsis?: boolean;
  columnDefaultWidth?: number;
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

  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  scrollStopDelay?: number;
  onScrollStop?: (param: ScrollStopInfo) => void;
  scrollToBottomOffset?: number;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (
    columnOrder: InfiniteTablePropColumnOrderNormalized,
  ) => void;
  onRowHeightChange?: (rowHeight: number) => void;

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
        rowArgs: InfiniteTableRowStyleFnParams<T>,
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
) => GetContextMenuItemsReturnType;

export type InfiniteTablePropGetContextMenuItems<T> = (
  param: {
    event: React.MouseEvent;
  } & Partial<InfiniteTableRowInfoDataDiscriminatorWithColumn<T>>,
  params: InfiniteTablePublicContext<T>,
) => GetContextMenuItemsReturnType;

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
