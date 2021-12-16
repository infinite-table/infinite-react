import type { ScrollPosition } from '../../types/ScrollPosition';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnSizingMap,
  InfiniteTablePropColumnsMap,
  InfiniteTablePropColumnTypesMap,
  InfiniteTableProps,
} from './InfiniteTableProps';

import { Size } from '../../types/Size';
import { MutableRefObject } from 'react';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import { NonUndefined } from '../../types/NonUndefined';
import {
  InfiniteTableColumn,
  InfiniteTablePivotColumn,
} from './InfiniteTableColumn';
import { ComponentStateActions } from '../../hooks/useComponentState';
import { DataSourceGroupRowsBy, DataSourceProps } from '../../DataSource/types';

export type GroupRowsMap<T> = Map<
  keyof T,
  { groupBy: DataSourceGroupRowsBy<T>; groupIndex: number }
>;

export interface InfiniteTableSetupState<T> {
  columnsWhenInlineGroupRenderStrategy?: Map<string, InfiniteTableColumn<T>>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onHeaderHeightCSSVarChange: SubscriptionCallback<number>;
  columnsWhenGrouping?: InfiniteTablePropColumnsMap<T>;
  bodySize: Size;
  focused: boolean;
  focusedWithin: boolean;
  scrollPosition: ScrollPosition;
  draggingColumnId: null | string;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;
  computedPivotColumns?: Map<string, InfiniteTablePivotColumn<T>>;
  columnShifts: number[] | null;
}

export type InfiniteTableComputedColumnGroup = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';

export interface InfiniteTableMappedState<T> {
  viewportReservedWidth: InfiniteTableProps<T>['viewportReservedWidth'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];

  loadingText: InfiniteTableProps<T>['loadingText'];
  components: InfiniteTableProps<T>['components'];
  columns: InfiniteTablePropColumnsMap<T>;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  onReady: InfiniteTableProps<T>['onReady'];

  onSelfFocus: InfiniteTableProps<T>['onSelfFocus'];
  onSelfBlur: InfiniteTableProps<T>['onSelfBlur'];
  onFocusWithin: InfiniteTableProps<T>['onFocusWithin'];
  onBlurWithin: InfiniteTableProps<T>['onBlurWithin'];

  onScrollToTop: InfiniteTableProps<T>['onScrollToTop'];
  onScrollToBottom: InfiniteTableProps<T>['onScrollToBottom'];
  scrollToBottomOffset: InfiniteTableProps<T>['scrollToBottomOffset'];

  focusedClassName: InfiniteTableProps<T>['focusedClassName'];
  focusedWithinClassName: InfiniteTableProps<T>['focusedWithinClassName'];
  focusedStyle: InfiniteTableProps<T>['focusedStyle'];
  focusedWithinStyle: InfiniteTableProps<T>['focusedWithinStyle'];
  domProps: InfiniteTableProps<T>['domProps'];
  rowStyle: InfiniteTableProps<T>['rowStyle'];
  rowProps: InfiniteTableProps<T>['rowProps'];
  rowClassName: InfiniteTableProps<T>['rowClassName'];
  pinnedStartMaxWidth: InfiniteTableProps<T>['pinnedStartMaxWidth'];
  pinnedEndMaxWidth: InfiniteTableProps<T>['pinnedEndMaxWidth'];
  pivotColumn: InfiniteTableProps<T>['pivotColumn'];
  pivotRowLabelsColumn: InfiniteTableProps<T>['pivotRowLabelsColumn'];
  pivotColumnGroups: InfiniteTableProps<T>['pivotColumnGroups'];

  activeIndex: NonUndefined<InfiniteTableProps<T>['activeIndex']>;
  columnMinWidth: NonUndefined<InfiniteTableProps<T>['columnMinWidth']>;
  columnMaxWidth: NonUndefined<InfiniteTableProps<T>['columnMaxWidth']>;
  columnDefaultWidth: NonUndefined<InfiniteTableProps<T>['columnDefaultWidth']>;
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
  columnVisibility: NonUndefined<InfiniteTableProps<T>['columnVisibility']>;
  columnPinning: NonUndefined<InfiniteTableProps<T>['columnPinning']>;
  columnSizing: InfiniteTablePropColumnSizingMap;
  columnTypes: InfiniteTablePropColumnTypesMap<T>;
  columnAggregations: NonUndefined<InfiniteTableProps<T>['columnAggregations']>;
  columnGroups: NonUndefined<InfiniteTableProps<T>['columnGroups']>;
  collapsedColumnGroups: NonUndefined<
    InfiniteTableProps<T>['collapsedColumnGroups']
  >;
  pivotTotalColumnPosition: NonUndefined<
    InfiniteTableProps<T>['pivotTotalColumnPosition']
  >;
}

export interface InfiniteTableDerivedState<T> {
  groupRowsBy: DataSourceProps<T>['groupRowsBy'];
  computedColumns: Map<string, InfiniteTableColumn<T>>;
  virtualizeHeader: boolean;

  groupRenderStrategy: NonUndefined<
    InfiniteTableProps<T>['groupRenderStrategy']
  >;

  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  computedColumnGroups: InfiniteTablePropColumnGroups;

  rowHeightCSSVar: string;
  headerHeightCSSVar: string;
}

export type InfiniteTableActions<T> = ComponentStateActions<
  InfiniteTableState<T>
>;
export interface InfiniteTableState<T>
  extends InfiniteTableMappedState<T>,
    InfiniteTableDerivedState<T>,
    InfiniteTableSetupState<T> {}
