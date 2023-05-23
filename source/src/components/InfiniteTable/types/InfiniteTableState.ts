import type { KeyboardEvent, MouseEvent, MutableRefObject } from 'react';
import { PointCoords } from '../../../utils/pageGeometry/Point';
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

import {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from './InfiniteTableColumn';
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
  keyof T | string,
  { groupBy: DataSourceGroupBy<T>; groupIndex: number }
>;

export type CellContextMenuLocation = {
  rowId: any;
  rowIndex: number;
  columnId: string;
  colIndex: number;
};

export type CellContextMenuLocationWithEvent = CellContextMenuLocation & {
  event: React.MouseEvent;
  target: HTMLElement;
};

export type ContextMenuLocationWithEvent = Partial<CellContextMenuLocation> & {
  event: React.MouseEvent;
  target: HTMLElement;
};

export interface InfiniteTableSetupState<T> {
  renderer: ReactHeadlessTableRenderer;
  getDOMNodeForCell: (cellPos: CellPosition) => HTMLElement | null;
  onRenderUpdater: SubscriptionCallback<Renderable>;
  propsCache: Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>;
  columnsWhenInlineGroupRenderStrategy?: Map<string, InfiniteTableColumn<T>>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  editingValueRef: MutableRefObject<any | null>;
  scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  focusDetectDOMRef: MutableRefObject<HTMLDivElement | null>;
  activeCellIndicatorDOMRef: MutableRefObject<HTMLDivElement | null>;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onColumnMenuClick: SubscriptionCallback<{
    target: HTMLElement | EventTarget;
    column: InfiniteTableComputedColumn<T>;
  }>;
  onFilterOperatorMenuClick: SubscriptionCallback<{
    target: HTMLElement | EventTarget;
    column: InfiniteTableComputedColumn<T>;
  }>;

  cellContextMenu: SubscriptionCallback<CellContextMenuLocationWithEvent>;
  contextMenu: SubscriptionCallback<ContextMenuLocationWithEvent>;

  cellContextMenuVisibleFor: CellContextMenuLocation | null;
  contextMenuVisibleFor:
    | (Partial<CellContextMenuLocation> & {
        point: PointCoords;
      })
    | null;

  columnMenuVisibleForColumnId: string | null;
  filterOperatorMenuVisibleForColumnId: string | null;
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
  columnVisibilityForGrouping: Record<string, false>;
  focusedWithin: boolean;
  scrollPosition: ScrollPosition;
  pinnedStartScrollListener: ScrollListener;
  pinnedEndScrollListener: ScrollListener;

  editingCell:
    | {
        active: true;
        accepted: false;
        columnId: string;
        value: any;
        persisted: false;
        initialValue: any;
        rowIndex: number;
        primaryKey: any;
      }
    | null
    | {
        active: false;
        columnId: string;
        rowIndex: number;
        value: any;
        initialValue: any;
        primaryKey?: any;
        waiting: 'accept' | 'persist' | false;
        accepted: boolean | Error;
        persisted: boolean | Error;
        cancelled?: boolean;
      };
}

export type InfiniteTableColumnGroupWithDepth = InfiniteTableColumnGroup & {
  depth: number;
};
export type InfiniteTableColumnGroupsDepthsMap = Map<string, number>;

export type InfiniteTablePropPivotTotalColumnPosition = false | 'start' | 'end';
export type InfiniteTablePropPivotGrandTotalColumnPosition =
  InfiniteTablePropPivotTotalColumnPosition;

export interface InfiniteTableMappedState<T> {
  id: InfiniteTableProps<T>['id'];
  scrollTopKey: InfiniteTableProps<T>['scrollTopKey'];
  viewportReservedWidth: InfiniteTableProps<T>['viewportReservedWidth'];
  resizableColumns: InfiniteTableProps<T>['resizableColumns'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  onKeyDown: InfiniteTableProps<T>['onKeyDown'];
  onCellClick: InfiniteTableProps<T>['onCellClick'];
  headerOptions: NonUndefined<InfiniteTableProps<T>['headerOptions']>;

  onScrollbarsChange: InfiniteTableProps<T>['onScrollbarsChange'];

  getContextMenuItems: InfiniteTableProps<T>['getContextMenuItems'];
  getCellContextMenuItems: InfiniteTableProps<T>['getCellContextMenuItems'];
  getColumnMenuItems: InfiniteTableProps<T>['getColumnMenuItems'];
  getFilterOperatorMenuItems: InfiniteTableProps<T>['getFilterOperatorMenuItems'];

  columnPinning: InfiniteTablePropColumnPinning;

  loadingText: InfiniteTableProps<T>['loadingText'];
  components: InfiniteTableProps<T>['components'];
  columns: InfiniteTableColumnsMap<T>;
  pivotColumns: InfiniteTableProps<T>['pivotColumns'];
  onReady: InfiniteTableProps<T>['onReady'];

  onContextMenu: InfiniteTableProps<T>['onContextMenu'];
  onCellContextMenu: InfiniteTableProps<T>['onCellContextMenu'];

  onSelfFocus: InfiniteTableProps<T>['onSelfFocus'];
  onSelfBlur: InfiniteTableProps<T>['onSelfBlur'];
  onFocusWithin: InfiniteTableProps<T>['onFocusWithin'];
  onBlurWithin: InfiniteTableProps<T>['onBlurWithin'];
  onEditCancelled: InfiniteTableProps<T>['onEditCancelled'];
  onEditRejected: InfiniteTableProps<T>['onEditRejected'];
  onEditAccepted: InfiniteTableProps<T>['onEditAccepted'];
  shouldAcceptEdit: InfiniteTableProps<T>['shouldAcceptEdit'];
  persistEdit: InfiniteTableProps<T>['persistEdit'];
  onEditPersistSuccess: InfiniteTableProps<T>['onEditPersistSuccess'];
  onEditPersistError: InfiniteTableProps<T>['onEditPersistError'];

  autoSizeColumnsKey: InfiniteTableProps<T>['autoSizeColumnsKey'];

  activeRowIndex: InfiniteTableProps<T>['activeRowIndex'];
  activeCellIndex: InfiniteTableProps<T>['activeCellIndex'];
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
  editable: InfiniteTableProps<T>['editable'];
  columnDefaultEditable: InfiniteTableProps<T>['columnDefaultEditable'];
  columnDefaultFilterable: InfiniteTableProps<T>['columnDefaultFilterable'];
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
  columnDefaultFlex: InfiniteTableProps<T>['columnDefaultFlex'];
  columnCssEllipsis: NonUndefined<InfiniteTableProps<T>['columnCssEllipsis']>;

  draggableColumns: NonUndefined<InfiniteTableProps<T>['draggableColumns']>;
  sortable: NonUndefined<InfiniteTableProps<T>['sortable']>;
  hideEmptyGroupColumns: NonUndefined<
    InfiniteTableProps<T>['hideEmptyGroupColumns']
  >;
  hideColumnWhenGrouped: NonUndefined<
    InfiniteTableProps<T>['hideColumnWhenGrouped']
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
  initialColumns: InfiniteTableProps<T>['columns'];

  showColumnFilters: NonUndefined<InfiniteTableProps<T>['showColumnFilters']>;

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
