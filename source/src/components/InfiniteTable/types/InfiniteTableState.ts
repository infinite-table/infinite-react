import type { KeyboardEvent, MouseEvent, MutableRefObject } from 'react';

import { DataSourceGroupBy, DataSourceProps } from '../../DataSource/types';
import { ReactHeadlessTableRenderer } from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { ComponentStateActions } from '../../hooks/useComponentState/types';
import { CellPosition } from '../../types/CellPosition';
import type { NonUndefined } from '../../types/NonUndefined';
import { Renderable } from '../../types/Renderable';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type { Size } from '../../types/Size';
import { SubscriptionCallback } from '../../types/SubscriptionCallback';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';

import { InfiniteTableColumn } from './InfiniteTableColumn';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroupsMap,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumnSizing,
  InfiniteTableColumnsMap,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';

export type GroupByMap<T> = Map<
  keyof T,
  { groupBy: DataSourceGroupBy<T>; groupIndex: number }
>;

export interface InfiniteTableSetupState<T> {
  renderer: ReactHeadlessTableRenderer;
  onRenderUpdater: SubscriptionCallback<Renderable>;
  propsCache: Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>;
  columnsWhenInlineGroupRenderStrategy?: Map<string, InfiniteTableColumn<T>>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  activeCellIndicatorDOMRef: MutableRefObject<HTMLDivElement | null>;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onColumnHeaderHeightCSSVarChange: SubscriptionCallback<number>;
  cellClick: SubscriptionCallback<CellPosition & { event: MouseEvent }>;
  cellMouseDown: SubscriptionCallback<CellPosition & { event: MouseEvent }>;
  keyDown: SubscriptionCallback<KeyboardEvent>;
  columnsWhenGrouping?: InfiniteTableColumnsMap<T>;
  bodySize: Size;
  brain: MatrixBrain;
  headerBrain: MatrixBrain;
  focused: boolean;
  ready: boolean;
  columnReorderDragColumnId: false | string;
  focusedWithin: boolean;
  scrollPosition: ScrollPosition;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;
}

export type InfiniteTableColumnGroupWithDepth = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';
export type InfiniteTablePropPivotGrandTotalColumnPosition =
  InfiniteTablePropPivotTotalColumnPosition;

export interface InfiniteTableMappedState<T> {
  scrollTopKey: InfiniteTableProps<T>['scrollTopKey'];
  viewportReservedWidth: InfiniteTableProps<T>['viewportReservedWidth'];
  resizableColumns: InfiniteTableProps<T>['resizableColumns'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  headerOptions: NonUndefined<InfiniteTableProps<T>['headerOptions']>;

  onScrollbarsChange: InfiniteTableProps<T>['onScrollbarsChange'];

  columnPinning: InfiniteTablePropColumnPinning;

  loadingText: InfiniteTableProps<T>['loadingText'];
  components: InfiniteTableProps<T>['components'];
  columns: InfiniteTableColumnsMap<T>;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  onReady: InfiniteTableProps<T>['onReady'];

  onSelfFocus: InfiniteTableProps<T>['onSelfFocus'];
  onSelfBlur: InfiniteTableProps<T>['onSelfBlur'];
  onFocusWithin: InfiniteTableProps<T>['onFocusWithin'];
  onBlurWithin: InfiniteTableProps<T>['onBlurWithin'];

  autoSizeColumnsKey: InfiniteTableProps<T>['autoSizeColumnsKey'];

  activeRowIndex: InfiniteTableProps<T>['activeRowIndex'];
  activeCellIndex: InfiniteTableProps<T>['activeCellIndex'];
  scrollStopDelay: NonUndefined<InfiniteTableProps<T>['scrollStopDelay']>;
  onScrollToTop: InfiniteTableProps<T>['onScrollToTop'];
  onScrollToBottom: InfiniteTableProps<T>['onScrollToBottom'];
  onScrollStop: InfiniteTableProps<T>['onScrollStop'];
  scrollToBottomOffset: InfiniteTableProps<T>['scrollToBottomOffset'];

  filterEditors: NonUndefined<InfiniteTableProps<T>['filterEditors']>;

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

  columnMinWidth: NonUndefined<InfiniteTableProps<T>['columnMinWidth']>;
  columnMaxWidth: NonUndefined<InfiniteTableProps<T>['columnMaxWidth']>;
  columnDefaultWidth: NonUndefined<InfiniteTableProps<T>['columnDefaultWidth']>;
  columnCssEllipsis: NonUndefined<InfiniteTableProps<T>['columnCssEllipsis']>;

  draggableColumns: NonUndefined<InfiniteTableProps<T>['draggableColumns']>;
  sortable: NonUndefined<InfiniteTableProps<T>['sortable']>;
  hideEmptyGroupColumns: NonUndefined<
    InfiniteTableProps<T>['hideEmptyGroupColumns']
  >;
  keyboardSelection: NonUndefined<InfiniteTableProps<T>['keyboardSelection']>;
  columnOrder: NonUndefined<InfiniteTableProps<T>['columnOrder']>;
  showZebraRows: NonUndefined<InfiniteTableProps<T>['showZebraRows']>;
  showHoverRows: NonUndefined<InfiniteTableProps<T>['showHoverRows']>;
  header: NonUndefined<InfiniteTableProps<T>['header']>;
  virtualizeColumns: NonUndefined<InfiniteTableProps<T>['virtualizeColumns']>;
  rowHeight: number;
  columnHeaderHeight: number;
  licenseKey: NonUndefined<InfiniteTableProps<T>['licenseKey']>;
  columnVisibility: InfiniteTablePropColumnVisibility;

  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnGroups: InfiniteTablePropColumnGroupsMap;
  collapsedColumnGroups: NonUndefined<
    InfiniteTableProps<T>['collapsedColumnGroups']
  >;
  pivotTotalColumnPosition: NonUndefined<
    InfiniteTableProps<T>['pivotTotalColumnPosition']
  >;
  pivotGrandTotalColumnPosition: InfiniteTableProps<T>['pivotGrandTotalColumnPosition'];
}

export interface InfiniteTableDerivedState<T> {
  groupBy: DataSourceProps<T>['groupBy'];
  computedColumns: Map<string, InfiniteTableColumn<T>>;

  groupRenderStrategy: NonUndefined<
    InfiniteTableProps<T>['groupRenderStrategy']
  >;

  columnHeaderCssEllipsis: NonUndefined<
    InfiniteTableProps<T>['columnHeaderCssEllipsis']
  >;
  keyboardNavigation: NonUndefined<InfiniteTableProps<T>['keyboardNavigation']>;

  columnGroupsDepthsMap: InfiniteTableColumnGroupsDepthsMap;
  columnGroupsMaxDepth: number;
  computedColumnGroups: InfiniteTablePropColumnGroupsMap;

  rowHeightCSSVar: string;
  columnHeaderHeightCSSVar: string;
  controlledColumnVisibility: boolean;
}

export type InfiniteTableActions<T> = ComponentStateActions<
  InfiniteTableState<T>
>;
export interface InfiniteTableState<T>
  extends InfiniteTableMappedState<T>,
    InfiniteTableDerivedState<T>,
    InfiniteTableSetupState<T> {}
