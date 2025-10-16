import type { KeyboardEvent, MouseEvent, MutableRefObject } from 'react';
import type { InfiniteTableRowInfo } from '.';
import type { PointCoords } from '../../../utils/pageGeometry/Point';
import type { RowDetailCache } from '../../DataSource/RowDetailCache';
import type { RowDetailState } from '../../DataSource/RowDetailState';
import type {
  RowDetailCacheEntry,
  RowDetailCacheKey,
} from '../../DataSource/state/getInitialState';
import type {
  DataSourceGroupBy,
  DataSourceProps,
} from '../../DataSource/types';
import type { GridRenderer } from '../../HeadlessTable/ReactHeadlessTableRenderer';
import type { ComponentStateActions } from '../../hooks/useComponentState/types';
import type { CellPositionByIndex } from '../../types/CellPositionByIndex';
import type { NonUndefined } from '../../types/NonUndefined';
import type { Renderable } from '../../types/Renderable';
import type { ScrollPosition } from '../../types/ScrollPosition';
import type { Size } from '../../types/Size';
import type { SubscriptionCallback } from '../../types/SubscriptionCallback';

import type { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import type { ScrollListener } from '../../VirtualBrain/ScrollListener';

import type {
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from './InfiniteTableColumn';
import type {
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumnPinning,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumnTypes,
  InfiniteTablePropColumnVisibility,
  InfiniteTableProps,
} from './InfiniteTableProps';
import { DebugWarningPayload, InfiniteTableDebugWarningKey } from './DevTools';

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
  brain: MatrixBrain;
  headerBrain: MatrixBrain;
  renderer: GridRenderer;
  onRenderUpdater: SubscriptionCallback<Renderable>;
  headerRenderer: GridRenderer;
  headerOnRenderUpdater: SubscriptionCallback<Renderable>;

  debugWarnings: Map<InfiniteTableDebugWarningKey, DebugWarningPayload>;

  devToolsDetected: boolean;

  forceBodyRerenderTimestamp: number;

  lastRowToExpandRef: MutableRefObject<any | null>;
  lastRowToCollapseRef: MutableRefObject<any | null>;
  getDOMNodeForCell: (cellPos: CellPositionByIndex) => HTMLElement | null;
  propsCache: Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>;
  columnsWhenInlineGroupRenderStrategy?: Record<string, InfiniteTableColumn<T>>;
  domRef: MutableRefObject<HTMLDivElement | null>;
  editingValueRef: MutableRefObject<any | null>;
  scrollerDOMRef: MutableRefObject<HTMLDivElement | null>;
  portalDOMRef: MutableRefObject<HTMLDivElement | null>;
  focusDetectDOMRef: MutableRefObject<HTMLDivElement | null>;
  activeCellIndicatorDOMRef: MutableRefObject<HTMLDivElement | null>;
  onFlashingDurationCSSVarChange: SubscriptionCallback<number>;
  flashingDurationCSSVarValue: number | null;
  onRowHeightCSSVarChange: SubscriptionCallback<number>;
  onRowDetailHeightCSSVarChange: SubscriptionCallback<number>;
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
  columnMenuTargetRef: MutableRefObject<HTMLElement | null>;
  columnMenuVisibleKey: string | number;
  filterOperatorMenuVisibleForColumnId: string | null;
  onColumnHeaderHeightCSSVarChange: SubscriptionCallback<number>;
  cellClick: SubscriptionCallback<CellPositionByIndex & { event: MouseEvent }>;
  cellMouseDown: SubscriptionCallback<
    CellPositionByIndex & { event: MouseEvent }
  >;
  keyDown: SubscriptionCallback<KeyboardEvent>;
  columnsWhenGrouping?: InfiniteTablePropColumns<T>;
  bodySize: Size;

  focused: boolean;
  ready: boolean;
  columnReorderDragColumnId: false | string;
  columnReorderInPageIndex: number | null;
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
  debugId: InfiniteTableProps<T>['debugId'];

  scrollTopKey: InfiniteTableProps<T>['scrollTopKey'];
  multiSortBehavior: NonUndefined<InfiniteTableProps<T>['multiSortBehavior']>;
  viewportReservedWidth: InfiniteTableProps<T>['viewportReservedWidth'];
  resizableColumns: InfiniteTableProps<T>['resizableColumns'];
  groupColumn: InfiniteTableProps<T>['groupColumn'];
  onKeyDown: InfiniteTableProps<T>['onKeyDown'];
  onCellClick: InfiniteTableProps<T>['onCellClick'];
  onCellDoubleClick: InfiniteTableProps<T>['onCellDoubleClick'];

  onRowMouseEnter: InfiniteTableProps<T>['onRowMouseEnter'];
  onRowMouseLeave: InfiniteTableProps<T>['onRowMouseLeave'];

  repeatWrappedGroupRows: InfiniteTableProps<T>['repeatWrappedGroupRows'];

  wrapRowsHorizontally: InfiniteTableProps<T>['wrapRowsHorizontally'];

  rowDetailCache: RowDetailCache<RowDetailCacheKey, RowDetailCacheEntry>;

  headerOptions: NonUndefined<InfiniteTableProps<T>['headerOptions']>;
  draggableColumnsRestrictTo: NonUndefined<
    InfiniteTableProps<T>['draggableColumnsRestrictTo']
  >;

  onScrollbarsChange: InfiniteTableProps<T>['onScrollbarsChange'];

  getContextMenuItems: InfiniteTableProps<T>['getContextMenuItems'];
  getCellContextMenuItems: InfiniteTableProps<T>['getCellContextMenuItems'];
  getColumnMenuItems: InfiniteTableProps<T>['getColumnMenuItems'];
  getFilterOperatorMenuItems: InfiniteTableProps<T>['getFilterOperatorMenuItems'];
  keyboardShortcuts: InfiniteTableProps<T>['keyboardShortcuts'];

  columnPinning: InfiniteTablePropColumnPinning;

  loadingText: InfiniteTableProps<T>['loadingText'];
  components: InfiniteTableProps<T>['components'];
  columns: InfiniteTablePropColumns<T>;
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

  onRenderRangeChange: InfiniteTableProps<T>['onRenderRangeChange'];

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
  columnMenuRealignDelay: NonUndefined<
    InfiniteTableProps<T>['columnMenuRealignDelay']
  >;
  columnDefaultEditable: InfiniteTableProps<T>['columnDefaultEditable'];
  columnDefaultFilterable: InfiniteTableProps<T>['columnDefaultFilterable'];
  columnDefaultGroupable: InfiniteTableProps<T>['columnDefaultGroupable'];
  columnDefaultSortable: InfiniteTableProps<T>['columnDefaultSortable'];
  rowStyle: InfiniteTableProps<T>['rowStyle'];
  cellStyle: InfiniteTableProps<T>['cellStyle'];
  rowProps: InfiniteTableProps<T>['rowProps'];
  rowClassName: InfiniteTableProps<T>['rowClassName'];
  rowHoverClassName: InfiniteTableProps<T>['rowHoverClassName'];
  cellClassName: InfiniteTableProps<T>['cellClassName'];
  pinnedStartMaxWidth: InfiniteTableProps<T>['pinnedStartMaxWidth'];
  pinnedEndMaxWidth: InfiniteTableProps<T>['pinnedEndMaxWidth'];
  pivotColumn: InfiniteTableProps<T>['pivotColumn'];
  pivotColumnGroups: InfiniteTablePropColumnGroups;

  columnMinWidth: NonUndefined<InfiniteTableProps<T>['columnMinWidth']>;
  columnMaxWidth: NonUndefined<InfiniteTableProps<T>['columnMaxWidth']>;
  columnDefaultWidth: NonUndefined<InfiniteTableProps<T>['columnDefaultWidth']>;
  columnDefaultFlex: InfiniteTableProps<T>['columnDefaultFlex'];
  columnCssEllipsis: NonUndefined<InfiniteTableProps<T>['columnCssEllipsis']>;

  draggableColumns: InfiniteTableProps<T>['draggableColumns'];
  columnDefaultDraggable: InfiniteTableProps<T>['columnDefaultDraggable'];
  sortable: InfiniteTableProps<T>['sortable'];
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
  rowHeight: number | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  rowDetailHeight: number | ((rowInfo: InfiniteTableRowInfo<T>) => number);
  columnHeaderHeight: number;
  licenseKey: NonUndefined<InfiniteTableProps<T>['licenseKey']>;
  columnVisibility: InfiniteTablePropColumnVisibility;

  columnGroupVisibility: NonUndefined<
    InfiniteTableProps<T>['columnGroupVisibility']
  >;

  columnSizing: InfiniteTablePropColumnSizing;
  columnTypes: InfiniteTablePropColumnTypes<T>;
  columnGroups: InfiniteTablePropColumnGroups;
  collapsedColumnGroups: NonUndefined<
    InfiniteTableProps<T>['collapsedColumnGroups']
  >;
  pivotTotalColumnPosition: NonUndefined<
    InfiniteTableProps<T>['pivotTotalColumnPosition']
  >;
  pivotGrandTotalColumnPosition: InfiniteTableProps<T>['pivotGrandTotalColumnPosition'];
}

export interface InfiniteTableDerivedState<T> {
  isTree: boolean;

  groupBy: DataSourceProps<T>['groupBy'];
  computedColumns: Record<string, InfiniteTableColumn<T>>;
  initialColumns: InfiniteTableProps<T>['columns'];

  rowDetailState: RowDetailState<T> | undefined;
  isRowDetailExpanded: InfiniteTableProps<T>['isRowDetailExpanded'] | undefined;

  rowDetailRenderer?: InfiniteTableProps<T>['rowDetailRenderer'];

  isRowDetailEnabled:
    | NonUndefined<InfiniteTableProps<T>['isRowDetailEnabled']>
    | boolean;

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
  computedColumnGroups: InfiniteTablePropColumnGroups;

  rowHeightCSSVar: string;
  rowDetailHeightCSSVar: string;
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
