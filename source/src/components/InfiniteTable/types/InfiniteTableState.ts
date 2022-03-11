import type { MutableRefObject } from 'react';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroupsMap,
  InfiniteTablePropColumnPinningMap,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnsMap,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';

import type { Size } from '../../types/Size';

import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import type { NonUndefined } from '../../types/NonUndefined';
import { InfiniteTableColumn } from './InfiniteTableColumn';
import { ComponentStateActions } from '../../hooks/useComponentState/types';
import { DataSourceGroupBy, DataSourceProps } from '../../DataSource/types';
import { VirtualBrain } from '../../VirtualBrain';

export type GroupByMap<T> = Map<
  keyof T,
  { groupBy: DataSourceGroupBy<T>; groupIndex: number }
>;

export interface InfiniteTableSetupState<T> {
  propsCache: Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>;
  columnsWhenInlineGroupRenderStrategy?: Map<string, InfiniteTableColumn<T>>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onHeaderHeightCSSVarChange: SubscriptionCallback<number>;
  columnsWhenGrouping?: InfiniteTablePropColumnsMap<T>;
  bodySize: Size;
  verticalVirtualBrain: VirtualBrain;
  horizontalVirtualBrain: VirtualBrain;
  focused: boolean;
  ready: boolean;
  focusedWithin: boolean;
  scrollPosition: ScrollPosition;
  draggingColumnId: null | string;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;
  columnShifts: number[] | null;
}

export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';

export interface InfiniteTableMappedState<T> {
  scrollTopKey: InfiniteTableProps<T>['scrollTopKey'];
  viewportReservedWidth: InfiniteTableProps<T>['viewportReservedWidth'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];

  onScrollbarsChange: InfiniteTableProps<T>['onScrollbarsChange'];

  loadingText: InfiniteTableProps<T>['loadingText'];
  components: InfiniteTableProps<T>['components'];
  columns: InfiniteTablePropColumnsMap<T>;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  onReady: InfiniteTableProps<T>['onReady'];

  onSelfFocus: InfiniteTableProps<T>['onSelfFocus'];
  onSelfBlur: InfiniteTableProps<T>['onSelfBlur'];
  onFocusWithin: InfiniteTableProps<T>['onFocusWithin'];
  onBlurWithin: InfiniteTableProps<T>['onBlurWithin'];

  autoSizeColumnsKey: InfiniteTableProps<T>['autoSizeColumnsKey'];

  scrollStopDelay: NonUndefined<InfiniteTableProps<T>['scrollStopDelay']>;
  onScrollToTop: InfiniteTableProps<T>['onScrollToTop'];
  onScrollToBottom: InfiniteTableProps<T>['onScrollToBottom'];
  onScrollStop: InfiniteTableProps<T>['onScrollStop'];
  scrollToBottomOffset: InfiniteTableProps<T>['scrollToBottomOffset'];

  focusedClassName: InfiniteTableProps<T>['focusedClassName'];
  focusedWithinClassName: InfiniteTableProps<T>['focusedWithinClassName'];
  focusedStyle: InfiniteTableProps<T>['focusedStyle'];
  focusedWithinStyle: InfiniteTableProps<T>['focusedWithinStyle'];
  showSeparatePivotColumnForSingleAggregation: NonUndefined<
    InfiniteTableProps<T>['showSeparatePivotColumnForSingleAggregation']
  >;
  domProps: InfiniteTableProps<T>['domProps'];
  rowStyle: InfiniteTableProps<T>['rowStyle'];
  rowProps: InfiniteTableProps<T>['rowProps'];
  rowClassName: InfiniteTableProps<T>['rowClassName'];
  pinnedStartMaxWidth: InfiniteTableProps<T>['pinnedStartMaxWidth'];
  pinnedEndMaxWidth: InfiniteTableProps<T>['pinnedEndMaxWidth'];
  pivotColumn: InfiniteTableProps<T>['pivotColumn'];
  pivotColumnGroups: InfiniteTablePropColumnGroupsMap;

  activeIndex: NonUndefined<InfiniteTableProps<T>['activeIndex']>;
  columnMinWidth: NonUndefined<InfiniteTableProps<T>['columnMinWidth']>;
  columnMaxWidth: NonUndefined<InfiniteTableProps<T>['columnMaxWidth']>;
  columnDefaultWidth: NonUndefined<InfiniteTableProps<T>['columnDefaultWidth']>;
  columnCssEllipsis: NonUndefined<InfiniteTableProps<T>['columnCssEllipsis']>;

  draggableColumns: NonUndefined<InfiniteTableProps<T>['draggableColumns']>;
  sortable: NonUndefined<InfiniteTableProps<T>['sortable']>;
  hideEmptyGroupColumns: NonUndefined<
    InfiniteTableProps<T>['hideEmptyGroupColumns']
  >;
  columnOrder: NonUndefined<InfiniteTableProps<T>['columnOrder']>;
  showZebraRows: NonUndefined<InfiniteTableProps<T>['showZebraRows']>;
  showHoverRows: NonUndefined<InfiniteTableProps<T>['showHoverRows']>;
  header: NonUndefined<InfiniteTableProps<T>['header']>;
  virtualizeColumns: NonUndefined<InfiniteTableProps<T>['virtualizeColumns']>;
  rowHeight: number;
  headerHeight: number;
  licenseKey: NonUndefined<InfiniteTableProps<T>['licenseKey']>;
  columnVisibility: InfiniteTablePropColumnVisibility;
  columnPinning: InfiniteTablePropColumnPinningMap;
  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnGroups: InfiniteTablePropColumnGroupsMap;
  collapsedColumnGroups: NonUndefined<
    InfiniteTableProps<T>['collapsedColumnGroups']
  >;
  pivotTotalColumnPosition: NonUndefined<
    InfiniteTableProps<T>['pivotTotalColumnPosition']
  >;
}

export interface InfiniteTableDerivedState<T> {
  groupBy: DataSourceProps<T>['groupBy'];
  computedColumns: Map<string, InfiniteTableColumn<T>>;
  virtualizeHeader: boolean;

  groupRenderStrategy: NonUndefined<
    InfiniteTableProps<T>['groupRenderStrategy']
  >;

  columnHeaderCssEllipsis: NonUndefined<
    InfiniteTableProps<T>['columnHeaderCssEllipsis']
  >;
  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  computedColumnGroups: InfiniteTablePropColumnGroupsMap;

  rowHeightCSSVar: string;
  headerHeightCSSVar: string;
  controlledColumnVisibility: boolean;
}

export type InfiniteTableActions<T> = ComponentStateActions<
  InfiniteTableState<T>
>;
export interface InfiniteTableState<T>
  extends InfiniteTableMappedState<T>,
    InfiniteTableDerivedState<T>,
    InfiniteTableSetupState<T> {}
