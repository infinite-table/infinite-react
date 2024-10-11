import { createRef, KeyboardEvent, MouseEvent } from 'react';
import {
  DataSourceGroupBy,
  DataSourcePropGroupBy,
  RowDetailStateObject,
  DataSourceState,
} from '../../DataSource';
import { RowDetailCache } from '../../DataSource/RowDetailCache';
import { RowDetailState } from '../../DataSource/RowDetailState';
import {
  RowDetailCacheEntry,
  RowDetailCacheKey,
} from '../../DataSource/state/getInitialState';

import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { CellPositionByIndex } from '../../types/CellPositionByIndex';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';

import { InfiniteTableColumnCellClassName } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import { ThemeVars } from '../vars.css';
import {
  InfiniteTableComputedColumn,
  InfiniteTableProps,
  InfiniteTableState,
} from '../types';
import {
  InfiniteTablePropColumns,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
  InfiniteTableMappedState,
  GroupByMap,
  CellContextMenuLocationWithEvent,
  ContextMenuLocationWithEvent,
} from '../types/InfiniteTableState';

import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';
import { getRowDetailRendererFromComponent } from './rowDetailRendererFromComponent';
import { HorizontalLayoutMatrixBrain } from '../../VirtualBrain/HorizontalLayoutMatrixBrain';
import { createRenderer } from '../../HeadlessTable/createRenderer';

const EMPTY_OBJECT = {};

export function getCellSelector(cellPosition?: CellPositionByIndex) {
  const selector = `.${InfiniteTableColumnCellClassName}[data-row-index${
    cellPosition ? `="${cellPosition.rowIndex}"` : ''
  }][data-col-index${cellPosition ? `="${cellPosition.colIndex}"` : ''}]`;

  return selector;
}

export function createBrains(debugId: string, wrapRowsHorizontally: boolean) {
  /**
   * This is the main virtualization brain that powers the table
   */
  const brain = !wrapRowsHorizontally
    ? new MatrixBrain(debugId)
    : new HorizontalLayoutMatrixBrain(debugId, {
        isHeader: false,
      });

  /**
   * The brain that virtualises the header is different from the main brain
   * because obviously the header will have different rowspans/colspans
   * (which are due to column groups) than the main grid viewport
   */
  const headerBrain = !wrapRowsHorizontally
    ? new MatrixBrain('header')
    : new HorizontalLayoutMatrixBrain('header', {
        isHeader: true,
        masterBrain: brain as HorizontalLayoutMatrixBrain,
      });

  // however, we sync the headerBrain with the main brain
  // on horizontal scrolling
  brain.onScroll((scrollPosition) => {
    headerBrain.setScrollPosition({
      scrollLeft: scrollPosition.scrollLeft,
      scrollTop: 0,
    });
  });

  if (__DEV__) {
    (globalThis as any).brain = brain;
    (globalThis as any).headerBrain = headerBrain;
  }

  const { renderer, onRenderUpdater } = createRenderer(brain);

  // and on width changes
  brain.onAvailableSizeChange((size) => {
    headerBrain.update({ width: size.width });
  });

  return { brain, headerBrain, renderer, onRenderUpdater };
}

/**
 * The computed state is independent from props and cannot
 * be affected by props.
 */
export function initSetupState<T>({
  debugId,
  wrapRowsHorizontally,
}: {
  debugId: string;
  wrapRowsHorizontally?: boolean;
}): InfiniteTableSetupState<T> {
  const columnsGeneratedForGrouping: InfiniteTablePropColumns<T> = {};

  const { brain, headerBrain, renderer, onRenderUpdater } = createBrains(
    debugId,
    !!wrapRowsHorizontally,
  );

  const domRef = createRef<HTMLDivElement>();

  return {
    renderer,
    onRenderUpdater,
    propsCache: new Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>([]),
    lastRowToCollapseRef: { current: null },
    lastRowToExpandRef: { current: null },

    cellContextMenuVisibleFor: null,
    contextMenuVisibleFor: null,
    columnMenuVisibleForColumnId: null,
    columnMenuVisibleKey: 0,
    filterOperatorMenuVisibleForColumnId: null,

    getDOMNodeForCell: (cellPosition: CellPositionByIndex) => {
      if (!domRef.current) {
        return null;
      }

      const selector = getCellSelector(cellPosition);

      return domRef.current.querySelector(selector) || null;
    },

    brain,
    headerBrain,

    domRef,
    columnMenuTargetRef: createRef(),
    editingValueRef: createRef(),
    scrollerDOMRef: createRef(),
    portalDOMRef: createRef(),
    focusDetectDOMRef: createRef(),
    activeCellIndicatorDOMRef: createRef(),

    onColumnMenuClick: buildSubscriptionCallback<{
      target: HTMLElement | EventTarget;
      column: InfiniteTableComputedColumn<T>;
    }>(),

    cellContextMenu:
      buildSubscriptionCallback<CellContextMenuLocationWithEvent>(),
    contextMenu: buildSubscriptionCallback<ContextMenuLocationWithEvent>(),

    onFilterOperatorMenuClick: buildSubscriptionCallback<{
      target: HTMLElement | EventTarget;
      column: InfiniteTableComputedColumn<T>;
    }>(),

    flashingDurationCSSVarValue: null,
    onFlashingDurationCSSVarChange: buildSubscriptionCallback<number>(),
    onRowHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onRowDetailHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onColumnHeaderHeightCSSVarChange: buildSubscriptionCallback<number>(),
    cellClick: buildSubscriptionCallback<
      CellPositionByIndex & { event: MouseEvent }
    >(),
    cellMouseDown: buildSubscriptionCallback<
      CellPositionByIndex & { event: MouseEvent }
    >(),
    keyDown: buildSubscriptionCallback<KeyboardEvent>(),
    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    columnReorderDragColumnId: false,
    columnReorderInPageIndex: null,
    ready: false,
    focused: false,
    focusedWithin: false,
    columnsWhenGrouping: columnsGeneratedForGrouping,
    columnVisibilityForGrouping: {},

    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),

    columnsWhenInlineGroupRenderStrategy: undefined,
    editingCell: null,
    forceBodyRerenderTimestamp: 0,
  };
}

export const forwardProps = <T>(
  _setupState: InfiniteTableSetupState<T>,
): ForwardPropsToStateFnResult<
  InfiniteTableProps<T>,
  InfiniteTableMappedState<T>,
  InfiniteTableSetupState<T>
> => {
  return {
    debugId: 1,
    scrollTopKey: 1,
    components: 1,
    id: 1,
    loadingText: 1,
    pivotColumns: 1,
    groupColumn: 1,
    onReady: 1,
    domProps: 1,
    debugMode: 1,
    onKeyDown: 1,
    onCellClick: 1,
    focusedClassName: 1,
    focusedWithinClassName: 1,
    focusedStyle: 1,
    focusedWithinStyle: 1,
    onSelfFocus: 1,
    onFocusWithin: 1,
    onSelfBlur: 1,
    onBlurWithin: 1,
    onContextMenu: 1,
    onCellContextMenu: 1,

    onRenderRangeChange: 1,

    onScrollToTop: 1,
    onScrollToBottom: 1,
    onScrollStop: 1,
    scrollToBottomOffset: 1,

    getColumnMenuItems: 1,
    getCellContextMenuItems: 1,
    getContextMenuItems: 1,
    columnPinning: 1,
    editable: 1,
    columnDefaultEditable: 1,
    columnDefaultFilterable: 1,
    columnDefaultSortable: 1,
    keyboardShortcuts: 1,

    rowStyle: 1,
    cellStyle: 1,

    rowProps: 1,
    rowClassName: 1,
    cellClassName: 1,

    repeatWrappedGroupRows: 1,

    pinnedStartMaxWidth: 1,
    pinnedEndMaxWidth: 1,
    pivotColumn: 1,
    pivotColumnGroups: 1,
    getFilterOperatorMenuItems: 1,

    onScrollbarsChange: 1,
    autoSizeColumnsKey: 1,

    wrapRowsHorizontally: 1,

    columnDefaultFlex: 1,

    draggableColumnsRestrictTo: (draggableColumnsRestrictTo) =>
      draggableColumnsRestrictTo ?? false,

    columnMenuRealignDelay: (columnMenuRealignDelay) =>
      columnMenuRealignDelay ?? 50,

    scrollStopDelay: (scrollStopDelay) => scrollStopDelay ?? 250,

    viewportReservedWidth: (viewportReservedWidth) =>
      viewportReservedWidth ?? 0,
    resizableColumns: (resizableColumns) => resizableColumns ?? true,

    rowDetailCache: (rowDetailCache) => {
      return new RowDetailCache<RowDetailCacheKey, RowDetailCacheEntry>(
        rowDetailCache,
      );
    },

    hideColumnWhenGrouped: (hideColumnWhenGrouped) =>
      hideColumnWhenGrouped ?? false,
    columnMinWidth: (columnMinWidth) => columnMinWidth ?? 30,
    columnMaxWidth: (columnMaxWidth) => columnMaxWidth ?? 5000,
    columnDefaultWidth: (columnDefaultWidth) => columnDefaultWidth ?? 200,

    columnCssEllipsis: (columnCssEllipsis) => columnCssEllipsis ?? true,
    draggableColumns: 1,
    columnDefaultDraggable: 1,
    headerOptions: (headerOptions) => ({
      alwaysReserveSpaceForSortIcon: true,
      ...headerOptions,
    }),

    showSeparatePivotColumnForSingleAggregation: (
      showSeparatePivotColumnForSingleAggregation,
    ) => showSeparatePivotColumnForSingleAggregation ?? false,
    sortable: 1,
    hideEmptyGroupColumns: (hideEmptyGroupColumns) =>
      hideEmptyGroupColumns ?? false,

    pivotTotalColumnPosition: (pivotTotalColumnPosition) =>
      pivotTotalColumnPosition ?? 'end',
    pivotGrandTotalColumnPosition: 1,

    // groupRenderStrategy: (groupRenderStrategy) =>
    //   groupRenderStrategy ?? 'multi-column',

    licenseKey: (licenseKey) => licenseKey || '',

    keyboardSelection: (keyboardSelection) => keyboardSelection ?? true,

    activeRowIndex: 1,
    activeCellIndex: 1,
    columnOrder: (columnOrder) => columnOrder ?? true,
    header: (header) => header ?? true,
    showZebraRows: (showZebraRows) => showZebraRows ?? true,
    showHoverRows: (showHoverRows) => showHoverRows ?? true,
    virtualizeColumns: (virtualizeColumns) => virtualizeColumns ?? true,

    rowHeight: (rowHeight) =>
      typeof rowHeight === 'number' || typeof rowHeight === 'function'
        ? rowHeight
        : 0,
    rowDetailHeight: (rowDetailHeight) =>
      typeof rowDetailHeight === 'number' ||
      typeof rowDetailHeight === 'function'
        ? rowDetailHeight
        : 300,
    columnHeaderHeight: (columnHeaderHeight) =>
      typeof columnHeaderHeight === 'number' ? columnHeaderHeight : 30,

    columns: 1,
    columnVisibility: (columnVisibility) => columnVisibility ?? EMPTY_OBJECT,
    columnGroupVisibility: (columnGroupVisibility) =>
      columnGroupVisibility ?? EMPTY_OBJECT,
    // TODO check if columnPinning works when the value for a pinned col is `true` instead of `"start"`

    columnSizing: (columnSizing) => columnSizing || {},
    columnTypes: (columnTypes) => columnTypes || {},

    onEditCancelled: 1,
    onEditRejected: 1,
    onEditAccepted: 1,

    persistEdit: 1,
    shouldAcceptEdit: 1,

    onEditPersistError: 1,
    onEditPersistSuccess: 1,

    multiSortBehavior: (multiSortBehavior) => multiSortBehavior ?? 'replace',

    collapsedColumnGroups: (collapsedColumnGroups) =>
      collapsedColumnGroups ?? new Map(),
    columnGroups: 1,
  };
};

type GetGroupColumnStrategyOptions<T> = {
  groupBy: DataSourceGroupBy<T>[];
  groupColumn?: Partial<InfiniteTablePropGroupColumn<T>>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
};

function getGroupRenderStrategy<T>(
  options: GetGroupColumnStrategyOptions<T>,
): InfiniteTablePropGroupRenderStrategy {
  const { groupBy, groupColumn, groupRenderStrategy } = options;

  if (groupRenderStrategy) {
    return groupRenderStrategy;
  }

  if (groupColumn != null && typeof groupColumn === 'object') {
    return 'single-column';
  }

  const columnsInGroupBy = groupBy.filter((g) => g.column);

  if (columnsInGroupBy.length) {
    return 'multi-column';
  }

  return 'multi-column';
}

export const cleanupState = <T>(state: InfiniteTableState<T>) => {
  state.brain.destroy();
  state.headerBrain.destroy();
  state.renderer.destroy();
  state.onRenderUpdater.destroy();

  state.onFlashingDurationCSSVarChange.destroy();
  state.onRowHeightCSSVarChange.destroy();
  state.onColumnHeaderHeightCSSVarChange.destroy();
  state.onColumnMenuClick.destroy();
  state.onFilterOperatorMenuClick.destroy();

  state.domRef.current = null;
  state.columnMenuTargetRef.current = null;
  state.scrollerDOMRef.current = null;
  state.portalDOMRef.current = null;

  state.onRowDetailHeightCSSVarChange.destroy();
  state.pinnedEndScrollListener.destroy();
  state.pinnedStartScrollListener.destroy();
};

export function getGroupByMap<T>(groupBy: DataSourcePropGroupBy<T>) {
  return groupBy.reduce((acc, groupBy, index) => {
    const value = {
      groupBy,
      groupIndex: index,
    };

    if (groupBy.field) {
      acc.set(groupBy.field, value);
    } else if (groupBy.groupField) {
      acc.set(groupBy.groupField, value);
    }

    return acc;
  }, new Map() as GroupByMap<T>);
}

const weakMap = new WeakMap<any, any>();

export function getMappedCallbacks<T>() {
  return {
    rowDetailState: (
      rowDetailState: RowDetailState<any>,
      state: InfiniteTableState<T>,
    ) => {
      return {
        callbackParams: [
          rowDetailState,
          {
            expandRow: state.lastRowToExpandRef.current,
            collapseRow: state.lastRowToCollapseRef.current,
          },
        ],
      };
    },
  };
}

export const mapPropsToState = <T>(params: {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  oldState: InfiniteTableState<T> | null;
  parentState: DataSourceState<T>;
}): InfiniteTableDerivedState<T> => {
  const { props, state, oldState, parentState } = params;

  const computedColumnGroups = state.pivotColumnGroups || state.columnGroups;

  const columnGroupsDepthsMap =
    (state.columnGroups && state.columnGroups != oldState?.columnGroups) ||
    (state.columnGroups &&
      state.columnGroupVisibility != oldState?.columnGroupVisibility) ||
    (state.pivotColumnGroups &&
      state.pivotColumnGroups != oldState?.pivotColumnGroups)
      ? computeColumnGroupsDepths(
          computedColumnGroups,
          state.columnGroupVisibility,
        )
      : state.columnGroupsDepthsMap;

  const groupBy = parentState?.groupBy;
  const groupRenderStrategy = getGroupRenderStrategy({
    groupRenderStrategy: props.groupRenderStrategy,
    groupBy,
    groupColumn: props.groupColumn,
  });

  let rowDetailState:
    | RowDetailState<any>
    | RowDetailStateObject<T>
    | undefined = undefined;

  let rowDetailRenderer = props.rowDetailRenderer;

  const RowDetailComponent = props.components?.RowDetail;
  if (!rowDetailRenderer && RowDetailComponent) {
    let rowDetailRendererFromComponent = weakMap.get(RowDetailComponent);

    if (!rowDetailRendererFromComponent) {
      rowDetailRendererFromComponent =
        getRowDetailRendererFromComponent(RowDetailComponent);
      weakMap.set(RowDetailComponent, rowDetailRendererFromComponent);
    }
    rowDetailRenderer = rowDetailRendererFromComponent;
  }
  if (rowDetailRenderer) {
    rowDetailState =
      props.rowDetailState ||
      state.rowDetailState ||
      props.defaultRowDetailState;

    if (rowDetailState && !(rowDetailState instanceof RowDetailState)) {
      rowDetailState = new RowDetailState(rowDetailState);
    }

    rowDetailState =
      rowDetailState ||
      new RowDetailState<any>({ expandedRows: [], collapsedRows: true });
  }

  const computedColumns =
    state.columnsWhenGrouping ||
    state.columnsWhenInlineGroupRenderStrategy ||
    state.columns;

  let isRowDetailExpanded = rowDetailState
    ? props.isRowDetailExpanded
    : undefined;

  if (!isRowDetailExpanded && rowDetailState) {
    // we use a weakmap to get the same isRowDetailsExpanded for the same instance of rowDetailState
    isRowDetailExpanded = weakMap.get(rowDetailState);
    if (!isRowDetailExpanded) {
      isRowDetailExpanded = (rowInfo) => {
        return (rowDetailState as RowDetailState).isRowDetailsExpanded(
          rowInfo.id,
        );
      };
      if (typeof rowDetailState === 'object') {
        weakMap.set(rowDetailState, isRowDetailExpanded);
      }
    }
  }

  const isRowDetailEnabled = !rowDetailRenderer
    ? false
    : props.isRowDetailEnabled || true;

  return {
    rowDetailRenderer,
    rowDetailState: rowDetailState as RowDetailState<any> | undefined,
    isRowDetailExpanded,
    isRowDetailEnabled,
    showColumnFilters: props.showColumnFilters ?? !!parentState.filterValue,
    controlledColumnVisibility: !!props.columnVisibility,
    groupRenderStrategy,
    groupBy: groupBy,
    computedColumns,
    initialColumns: props.columns,

    keyboardNavigation:
      props.keyboardNavigation ??
      (state.activeCellIndex != null
        ? 'cell'
        : state.activeRowIndex != null
        ? 'row'
        : 'cell'),

    columnHeaderCssEllipsis:
      props.columnHeaderCssEllipsis ?? props.columnCssEllipsis ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth:
      columnGroupsDepthsMap != state.columnGroupsDepthsMap
        ? // was 0, but after implementing columnGroupVisibility
          // it can be -1, to denote that no column group is visible
          Math.max(...columnGroupsDepthsMap.values(), -1)
        : state.columnGroupsMaxDepth,
    computedColumnGroups,

    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    rowDetailHeightCSSVar:
      typeof props.rowDetailHeight === 'string' ? props.rowDetailHeight : '',
    columnHeaderHeightCSSVar:
      typeof props.columnHeaderHeight === 'string'
        ? props.columnHeaderHeight ||
          ThemeVars.components.Header.columnHeaderHeight
        : '',
  };
};
