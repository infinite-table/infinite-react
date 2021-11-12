import * as React from 'react';
import { InfiniteTableState } from '.';
import {
  AggregationReducer,
  InfiniteTableEnhancedData,
} from '../../../utils/groupAndPivot';
import {
  DataSourceGroupRowsBy,
  DataSourcePropGroupRowsBy,
  DataSourcePropPivotBy,
  DataSourceState,
} from '../../DataSource';
import { Renderable } from '../../types/Renderable';
import type {
  InfiniteTableBaseColumn,
  InfiniteTableColumn,
  InfiniteTableColumnRenderFunction,
  InfiniteTableColumnWithSize,
  InfiniteTableComputedColumn,
  InfiniteTablePivotColumn,
} from './InfiniteTableColumn';
import { InfiniteTablePropPivotTotalColumnPosition } from './InfiniteTableState';

// export type TablePropColumnOrderItem = string | { id: string; visible: boolean };
export type InfiniteTablePropColumnOrderNormalized = string[];
export type InfiniteTablePropColumnOrder =
  | InfiniteTablePropColumnOrderNormalized
  | true;

export type InfiniteTablePropColumnVisibility = Map<string, false>;
export type InfiniteTablePropColumnPinning = Map<
  string,
  true | 'start' | 'end'
>;

export type InfiniteTableRowStyleFnParams<T> = {
  data: T | null;
  enhancedData: InfiniteTableEnhancedData<T>;
  rowIndex: number;
  groupRowsBy?: (keyof T)[];
};
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
  'getter'
> & {
  getter?: AggregationReducer<T, AggregationResultType>['getter'];
};

export type InfiniteTablePropColumnAggregations<T> = Map<
  string,
  InfiniteTableColumnAggregator<T, any>
>;

export type InfiniteTableImperativeApi<T> = {
  setColumnOrder: (columnOrder: InfiniteTablePropColumnOrder) => void;
  setColumnVisibility: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  setColumnAggregations: (
    columnAggregations: InfiniteTablePropColumnAggregations<T>,
  ) => void;
  x?: T;
  getState: () => InfiniteTableState<T>;
  getDataSourceState: () => DataSourceState<T>;
};
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
> = Map<string, ColumnType>;

export type InfiniteTableColumns<T> = InfiniteTablePropColumns<T>;

export type InfiniteTablePropColumnGroups = Map<
  string,
  InfiniteTableColumnGroup
>;

/**
 * the keys is an array of strings: first string in the array is the column group id, next strings are the ids of all columns in the group
 * the value is the id of the column to leave as visible
 */
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

export type GroupColumnGetterOptions<T> = {
  groupIndex?: number;
  groupCount: number;
  groupBy?: DataSourceGroupRowsBy<T>;
  groupRowsBy: DataSourceGroupRowsBy<T>[];
};

export type PivotColumnGetterOptions<T> = {
  column: InfiniteTablePivotColumn<T>;
  groupRowsBy: DataSourcePropGroupRowsBy<T>;
  pivotBy: DataSourcePropPivotBy<T>;
};

export type InfiniteTablePropGroupRenderStrategy =
  | 'single-column'
  | 'multi-column'
  | 'inline';
export type InfiniteTableGroupColumnBase<T> = InfiniteTableBaseColumn<T> &
  InfiniteTableColumnWithSize & {
    renderValue?: InfiniteTableColumnRenderFunction<T>;
  };
export type InfiniteTablePivotColumnBase<T> = InfiniteTableColumn<T> &
  InfiniteTableColumnWithSize & {
    renderValue?: InfiniteTableColumnRenderFunction<T>;
  };
export type InfiniteTablePropGroupColumn<T> =
  | InfiniteTableGroupColumnBase<T>
  | ((
      options: GroupColumnGetterOptions<T>,
      toggleGroupRow: (groupKeys: any[]) => void,
    ) => InfiniteTableGroupColumnBase<T>);

export type InfiniteTablePropPivotColumn<T> =
  | InfiniteTablePivotColumnBase<T>
  | ((options: PivotColumnGetterOptions<T>) => InfiniteTablePivotColumnBase<T>);

export type InfiniteTablePropPivotRowLabelsColumn<T> =
  InfiniteTablePropPivotColumn<T>;

export interface InfiniteTableProps<T> {
  columns: InfiniteTablePropColumns<T>;
  pivotColumns?: InfiniteTablePropColumns<T, InfiniteTablePivotColumn<T>>;

  pivotColumn?: Partial<InfiniteTablePropPivotColumn<T>>;
  pivotRowLabelsColumn?: Partial<InfiniteTablePropPivotRowLabelsColumn<T>>;
  pivotTotalColumnPosition?: InfiniteTablePropPivotTotalColumnPosition;
  groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
  hideEmptyGroupColumns?: boolean;

  columnVisibility?: InfiniteTablePropColumnVisibility;
  defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
  columnPinning?: InfiniteTablePropColumnPinning;
  pinnedStartMaxWidth?: number;
  pinnedEndMaxWidth?: number;
  defaultColumnPinning?: InfiniteTablePropColumnPinning;

  defaultColumnAggregations?: InfiniteTablePropColumnAggregations<T>;
  columnAggregations?: InfiniteTablePropColumnAggregations<T>;

  pivotColumnGroups?: InfiniteTablePropColumnGroups;
  columnGroups?: InfiniteTablePropColumnGroups;
  defaultColumnGroups?: InfiniteTablePropColumnGroups;

  defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
  collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;

  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  // columnVisibilityAssumeVisible?: boolean;

  rowHeight: number | string;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  headerHeight: number | string;
  domProps?: React.HTMLProps<HTMLDivElement>;
  showZebraRows?: boolean;
  showHoverRows?: boolean;
  sortable?: boolean;
  draggableColumns?: boolean;
  header?: boolean;
  focusedClassName?: string;
  focusedWithinClassName?: string;
  focusedStyle?: React.CSSProperties;
  focusedWithinStyle?: React.CSSProperties;
  columnDefaultWidth?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  defaultActiveIndex?: number;
  activeIndex?: number;

  onSelfFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onSelfBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocusWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlurWithin?: (event: React.FocusEvent<HTMLDivElement>) => void;

  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
  scrollToBottomOffset?: number;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;
  onRowHeightChange?: (rowHeight: number) => void;

  onReady?: (api: InfiniteTableImperativeApi<T>) => void;

  rowProps?:
    | React.HTMLProps<HTMLDivElement>
    | ((
        rowArgs: InfiniteTableRowStyleFnParams<T>,
      ) => React.HTMLProps<HTMLDivElement>);

  licenseKey?: string;
}
