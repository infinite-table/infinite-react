import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTableColumnGroup,
  InfiniteTableGeneratedColumns,
  InfiniteTablePropCollapsedColumnGroups,
  InfiniteTablePropColumnAggregations,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnOrder,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';
import { Size } from '../../types/Size';
import { ComponentStateActions } from '../../hooks/useComponentState';
import { MutableRefObject } from 'react';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';

export interface InfiniteTableState<T> {
  domRef: MutableRefObject<HTMLDivElement | null>;
  bodyDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;

  bodySizeRef: MutableRefObject<Size | null>;

  onRowHeightChange: SubscriptionCallback<number>;
  onHeaderHeightChange: SubscriptionCallback<number>;

  rowHeight: number;
  headerHeight: number;

  columnShifts: null | number[];
  draggingColumnId: null | string;
  // viewportSize: Size;
  bodySize: Size;
  scrollPosition: ScrollPosition;
  columnOrder: InfiniteTablePropColumnOrder;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnPinning: InfiniteTablePropColumnPinning;
  columnAggregations: InfiniteTablePropColumnAggregations<T>;
  columnGroups: InfiniteTablePropColumnGroups;
  collapsedColumnGroups: InfiniteTablePropCollapsedColumnGroups;
  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  columns: InfiniteTableProps<T>['columns'];
  generatedColumns: InfiniteTableGeneratedColumns<T>;

  x?: T;
}

export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export interface InfiniteTableComponentState<T>
  extends InfiniteTableState<T>,
    InfiniteTableReadOnlyState<T> {}

export interface InfiniteTableReadOnlyState<T> {
  onReady: InfiniteTableProps<T>['onReady'];
  rowProps: InfiniteTableProps<T>['rowProps'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];

  showZebraRows: InfiniteTableProps<T>['showZebraRows'];
  header: InfiniteTableProps<T>['header'];
  columnMinWidth: InfiniteTableProps<T>['columnMinWidth'];
  columnMaxWidth: InfiniteTableProps<T>['columnMaxWidth'];
  columnDefaultWidth: InfiniteTableProps<T>['columnDefaultWidth'];
  sortable: InfiniteTableProps<T>['sortable'];
  virtualizeColumns: InfiniteTableProps<T>['virtualizeColumns'];
  virtualizeHeader: boolean;
  licenseKey: string;
  domProps: InfiniteTableProps<T>['domProps'];
  draggableColumns: boolean;
  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;

  rowHeightCSSVar: string;
  headerHeightCSSVar: string;
}

export type InfiniteTableComponentActions<T> = ComponentStateActions<
  InfiniteTableState<T>
>;
