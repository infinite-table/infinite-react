import { createRef } from 'react';

import { DataSourceGroupBy, DataSourceState } from '../../DataSource';
import { ReactHeadlessTableRenderer } from '../../HeadlessTable/ReactHeadlessTableRenderer';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { Renderable } from '../../types/Renderable';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { MatrixBrain } from '../../VirtualBrain/MatrixBrain';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import { defaultFilterEditors } from '../components/FilterEditors';
import { ThemeVars } from '../theme.css';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import {
  InfiniteTableColumns,
  InfiniteTablePropFilterEditors,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
  InfiniteTableMappedState,
} from '../types/InfiniteTableState';
import { toMap } from '../utils/toMap';

import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

function createRenderer(brain: MatrixBrain) {
  const renderer = new ReactHeadlessTableRenderer(brain);
  const onRenderUpdater = buildSubscriptionCallback<Renderable>();

  brain.onDestroy(() => {
    renderer.destroy();
    onRenderUpdater.destroy();
  });

  return {
    renderer,
    onRenderUpdater,
  };
}
/**
 * The computed state is independent from props and cannot
 * be affected by props.
 */
export function initSetupState<T>(): InfiniteTableSetupState<T> {
  const columnsGeneratedForGrouping: InfiniteTableColumns<T> = new Map();

  /**
   * This is the main virtualization brain that powers the table
   */
  const brain = new MatrixBrain();

  /**
   * The brain that virtualises the header is different from the main brain
   * because obviously the header will have different rowspans/colspans
   * (which are due to column groups) than the main grid viewport
   */
  const headerBrain = new MatrixBrain();

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
  }

  const { renderer, onRenderUpdater } = createRenderer(brain);

  // and on width changes
  brain.onAvailableSizeChange((size) => {
    headerBrain.setAvailableSize({ width: size.width });
  });

  if (__DEV__) {
    (globalThis as any).renderer = renderer;
  }

  return {
    renderer,
    onRenderUpdater,
    propsCache: new Map<keyof InfiniteTableProps<T>, WeakMap<any, any>>([]),

    // TODO destroy the brains on unmount
    brain,
    headerBrain,

    columnShifts: null,

    domRef: createRef(),
    scrollerDOMRef: createRef(),
    portalDOMRef: createRef(),

    onRowHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onColumnHeaderHeightCSSVarChange: buildSubscriptionCallback<number>(),
    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    ready: false,
    focused: false,
    focusedWithin: false,
    columnsWhenGrouping: columnsGeneratedForGrouping,
    draggingColumnId: null,

    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),

    columnsWhenInlineGroupRenderStrategy: undefined,
  };
}

export const forwardProps = <T>(
  setupState: InfiniteTableSetupState<T>,
): ForwardPropsToStateFnResult<
  InfiniteTableProps<T>,
  InfiniteTableMappedState<T>
> => {
  return {
    scrollTopKey: 1,
    components: 1,
    loadingText: 1,
    pivotColumns: 1,
    groupColumn: 1,
    onReady: 1,
    domProps: 1,
    focusedClassName: 1,
    focusedWithinClassName: 1,
    focusedStyle: 1,
    focusedWithinStyle: 1,
    onSelfFocus: 1,
    onFocusWithin: 1,
    onSelfBlur: 1,
    onBlurWithin: 1,

    onScrollToTop: 1,
    onScrollToBottom: 1,
    onScrollStop: 1,
    scrollToBottomOffset: 1,

    rowStyle: 1,
    rowProps: 1,
    rowClassName: 1,
    pinnedStartMaxWidth: 1,
    pinnedEndMaxWidth: 1,
    pivotColumn: 1,
    pivotColumnGroups: 1,

    onScrollbarsChange: 1,
    autoSizeColumnsKey: 1,

    scrollStopDelay: (scrollStopDelay) => scrollStopDelay ?? 250,

    filterEditors: (filterEditors) =>
      ({
        ...defaultFilterEditors,
        ...filterEditors,
      } as InfiniteTablePropFilterEditors<T>),

    viewportReservedWidth: (viewportReservedWidth) =>
      viewportReservedWidth ?? 0,

    columnMinWidth: (columnMinWidth) => columnMinWidth ?? 30,
    columnMaxWidth: (columnMaxWidth) => columnMaxWidth ?? 2000,
    columnDefaultWidth: (columnDefaultWidth) => columnDefaultWidth ?? 200,

    columnCssEllipsis: (columnCssEllipsis) => columnCssEllipsis ?? true,
    draggableColumns: (draggableColumns) => draggableColumns ?? true,
    headerOptions: (headerOptions) => ({
      alwaysReserveSpaceForSortIcon: true,
      ...headerOptions,
    }),

    showSeparatePivotColumnForSingleAggregation: (
      showSeparatePivotColumnForSingleAggregation,
    ) => showSeparatePivotColumnForSingleAggregation ?? false,
    sortable: (sortable) => sortable ?? true,
    hideEmptyGroupColumns: (hideEmptyGroupColumns) =>
      hideEmptyGroupColumns ?? false,

    pivotTotalColumnPosition: (pivotTotalColumnPosition) =>
      pivotTotalColumnPosition ?? 'end',
    pivotGrandTotalColumnPosition: 1,

    // groupRenderStrategy: (groupRenderStrategy) =>
    //   groupRenderStrategy ?? 'multi-column',

    licenseKey: (licenseKey) => licenseKey || '',
    keyboardNavigation: (keyboardNavigation) => keyboardNavigation || 'cell',

    activeRowIndex: 1,
    activeCellIndex: 1,
    columnOrder: (columnOrder) => columnOrder ?? true,
    header: (header) => header ?? true,
    showZebraRows: (showZebraRows) => showZebraRows ?? true,
    showHoverRows: (showHoverRows) => showHoverRows ?? true,
    virtualizeColumns: (virtualizeColumns) => virtualizeColumns ?? true,

    rowHeight: (rowHeight) => (typeof rowHeight === 'number' ? rowHeight : 0),
    columnHeaderHeight: (columnHeaderHeight) =>
      typeof columnHeaderHeight === 'number' ? columnHeaderHeight : 30,

    columns: (columns) => toMap(columns, setupState.propsCache.get('columns')),
    columnVisibility: (columnVisibility) => columnVisibility ?? {},
    // TODO check if columnPinning works when the value for a pinned col is `true` instead of `"start"`
    columnPinning: (columnPinning) =>
      toMap(columnPinning, setupState.propsCache.get('columnPinning')),
    columnSizing: (columnSizing) => columnSizing || {},
    columnTypes: (columnTypes) => columnTypes || {},

    collapsedColumnGroups: (collapsedColumnGroups) =>
      collapsedColumnGroups ?? new Map(),
    columnGroups: (columnGroups) =>
      toMap(columnGroups, setupState.propsCache.get('columnGroups')),
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
    (state.pivotColumnGroups &&
      state.pivotColumnGroups != oldState?.pivotColumnGroups)
      ? computeColumnGroupsDepths(computedColumnGroups)
      : state.columnGroupsDepthsMap;

  const groupBy = parentState?.groupBy;
  const groupRenderStrategy = getGroupRenderStrategy({
    groupRenderStrategy: props.groupRenderStrategy,
    groupBy,
    groupColumn: props.groupColumn,
  });

  const computedColumns =
    state.columnsWhenGrouping ||
    state.columnsWhenInlineGroupRenderStrategy ||
    state.columns;

  return {
    controlledColumnVisibility: !!props.columnVisibility,
    groupRenderStrategy,
    groupBy: groupBy,
    computedColumns,

    columnHeaderCssEllipsis:
      props.columnHeaderCssEllipsis ?? props.columnCssEllipsis ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth:
      columnGroupsDepthsMap != state.columnGroupsDepthsMap
        ? Math.max(...columnGroupsDepthsMap.values(), 0)
        : state.columnGroupsMaxDepth,
    computedColumnGroups,

    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    columnHeaderHeightCSSVar:
      typeof props.columnHeaderHeight === 'string'
        ? props.columnHeaderHeight ||
          ThemeVars.components.Header.columnHeaderHeight
        : '',
  };
};
