import * as React from 'react';
import { AggregationReducer } from '../../../utils/groupAndPivot';
import { Renderable } from '../../types/Renderable';
import type {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from './InfiniteTableColumn';

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
};
export type InfiniteTablePropVirtualizeColumns<T> =
  | boolean
  | ((columns: InfiniteTableComputedColumn<T>[]) => boolean);

export type InfiniteTableInternalProps<T> = {
  rowHeight: number;
  ___t?: T;
};

export type InfiniteTablePropColumns<T> = Map<string, InfiniteTableColumn<T>>;

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

export type InfiniteTableProps<T> = {
  columns: InfiniteTablePropColumns<T>;

  columnVisibility?: InfiniteTablePropColumnVisibility;
  defaultColumnVisibility?: InfiniteTablePropColumnVisibility;
  columnPinning?: InfiniteTablePropColumnPinning;
  defaultColumnPinning?: InfiniteTablePropColumnPinning;

  defaultColumnAggregations?: InfiniteTablePropColumnAggregations<T>;
  columnAggregations?: InfiniteTablePropColumnAggregations<T>;

  columnGroups?: InfiniteTablePropColumnGroups;
  defaultColumnGroups?: InfiniteTablePropColumnGroups;

  defaultCollapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;
  collapsedColumnGroups?: InfiniteTablePropCollapsedColumnGroups;

  onColumnVisibilityChange?: (
    columnVisibility: InfiniteTablePropColumnVisibility,
  ) => void;
  // columnVisibilityAssumeVisible?: boolean;

  rowHeight: number | string;
  domProps?: React.HTMLProps<HTMLDivElement>;
  showZebraRows?: boolean;
  sortable?: boolean;
  draggableColumns?: boolean;
  header?: boolean;
  columnDefaultWidth?: number;
  columnMinWidth?: number;
  columnMaxWidth?: number;
  virtualizeColumns?: InfiniteTablePropVirtualizeColumns<T>;
  virtualizeRows?: boolean;

  defaultColumnOrder?: InfiniteTablePropColumnOrder;
  columnOrder?: InfiniteTablePropColumnOrder;
  onColumnOrderChange?: (columnOrder: InfiniteTablePropColumnOrder) => void;

  onReady?: (api: InfiniteTableImperativeApi<T>) => void;

  rowProps?:
    | React.HTMLProps<HTMLDivElement>
    | ((rowArgs: {
        rowIndex: number;
        data: T | null;
      }) => React.HTMLProps<HTMLDivElement>);

  licenseKey?: string;
};

export type InfiniteTableOwnProps<T> = InfiniteTableProps<T> & {
  rowHeight: number;
  rowHeightCSSVar: string;
  onHeaderResize: (height: number) => void;
  bodyDOMRef?: React.RefObject<HTMLDivElement | null>;
};
