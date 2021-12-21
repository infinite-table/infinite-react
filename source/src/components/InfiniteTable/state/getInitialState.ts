import { createRef } from 'react';
import { DataSourceGroupRowsBy, DataSourceState } from '../../DataSource';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';

import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import {
  InfiniteTableColumns,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
  InfiniteTableMappedState,
} from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

function toMap<K extends string, V>(
  mapOrObject?: Map<K, V> | Record<K, V>,
): Map<K, V> {
  if (!mapOrObject) {
    return new Map<K, V>();
  }

  if (mapOrObject instanceof Map) {
    return mapOrObject;
  }

  return new Map<K, V>(Object.entries(mapOrObject) as [K, V][]);
}

function toColumnTypesMap<K extends string, V>(
  mapOrObject?: Map<K, V> | Record<K, V>,
): Map<K, V> {
  // if (!mapOrObject) {
  //   mapOrObject = {} as Record<K, V>;
  // }

  // // TODO continue here
  // if (mapOrObject instanceof Map) {
  // }

  return toMap(mapOrObject);
}

/**
 * The computed state is independent from props and cannot
 * be affected by props
 */
export function initSetupState<T>(): InfiniteTableSetupState<T> {
  const columnsGeneratedForGrouping: InfiniteTableColumns<T> = new Map();

  return {
    columnShifts: null,
    domRef: createRef(),
    scrollerDOMRef: createRef(),
    portalDOMRef: createRef(),

    onRowHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onHeaderHeightCSSVarChange: buildSubscriptionCallback<number>(),
    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    focused: false,
    focusedWithin: false,
    columnsWhenGrouping: columnsGeneratedForGrouping,
    draggingColumnId: null,
    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),
    computedPivotColumns: undefined,
    columnsWhenInlineGroupRenderStrategy: undefined,
  };
}

export const forwardProps = <T>(): ForwardPropsToStateFnResult<
  InfiniteTableProps<T>,
  InfiniteTableMappedState<T>
> => {
  return {
    columns: (columns) => toMap(columns) ?? new Map(),
    scrollTopId: 1,
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
    scrollToBottomOffset: 1,

    rowStyle: 1,
    rowProps: 1,
    rowClassName: 1,
    pinnedStartMaxWidth: 1,
    pinnedEndMaxWidth: 1,
    pivotColumn: 1,
    pivotRowLabelsColumn: 1,
    pivotColumnGroups: 1,

    onScrollbarsChange: 1,

    viewportReservedWidth: (viewportReservedWidth) =>
      viewportReservedWidth ?? 0,
    activeIndex: (activeIndex) => activeIndex ?? 0,
    columnMinWidth: (columnMinWidth) => columnMinWidth ?? 30,
    columnMaxWidth: (columnMaxWidth) => columnMaxWidth ?? 2000,
    columnDefaultWidth: (columnDefaultWidth) => columnDefaultWidth ?? 200,
    draggableColumns: (draggableColumns) => draggableColumns ?? true,

    sortable: (sortable) => sortable ?? true,
    hideEmptyGroupColumns: (hideEmptyGroupColumns) =>
      hideEmptyGroupColumns ?? false,

    pivotTotalColumnPosition: (pivotTotalColumnPosition) =>
      pivotTotalColumnPosition ?? 'end',
    // groupRenderStrategy: (groupRenderStrategy) =>
    //   groupRenderStrategy ?? 'multi-column',

    licenseKey: (licenseKey) => licenseKey || '',

    columnOrder: (columnOrder) => columnOrder ?? true,
    header: (header) => header ?? true,
    showZebraRows: (showZebraRows) => showZebraRows ?? true,
    showHoverRows: (showHoverRows) => showHoverRows ?? true,
    virtualizeColumns: (virtualizeColumns) => virtualizeColumns ?? true,

    rowHeight: (rowHeight) => (typeof rowHeight === 'number' ? rowHeight : 0),
    headerHeight: (headerHeight) =>
      typeof headerHeight === 'number' ? headerHeight : 0,

    columnVisibility: (columnVisibility) => columnVisibility ?? new Map(),
    columnPinning: (columnPinning) => columnPinning ?? new Map(),
    columnSizing: (columnSizing) => toMap(columnSizing) ?? new Map(),
    columnTypes: (columnTypes) => toColumnTypesMap(columnTypes) ?? new Map(),
    columnAggregations: (columnAggregations) => columnAggregations ?? new Map(),

    collapsedColumnGroups: (collapsedColumnGroups) =>
      collapsedColumnGroups ?? new Map(),
    columnGroups: (columnGroups) => columnGroups ?? new Map(),
  };
};

type GetGroupColumnStrategyOptions<T> = {
  groupRowsBy: DataSourceGroupRowsBy<T>[];
  groupColumn?: InfiniteTablePropGroupColumn<T>;
  groupRenderStrategy?: InfiniteTablePropGroupRenderStrategy;
};

function getGroupRenderStrategy<T>(
  options: GetGroupColumnStrategyOptions<T>,
): InfiniteTablePropGroupRenderStrategy {
  const { groupRowsBy, groupColumn, groupRenderStrategy } = options;

  if (groupRenderStrategy) {
    return groupRenderStrategy;
  }

  if (groupColumn != null && typeof groupColumn === 'object') {
    return 'single-column';
  }

  const columnsInGroupRowsBy = groupRowsBy.filter((g) => g.column);

  if (columnsInGroupRowsBy.length) {
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
  const { virtualizeColumns, header } = state;

  const computedColumnGroups = state.pivotColumnGroups || state.columnGroups;
  const virtualizeHeader =
    header &&
    virtualizeColumns &&
    (!computedColumnGroups || computedColumnGroups?.size === 0);

  const columnGroupsDepthsMap =
    (state.columnGroups && state.columnGroups != oldState?.columnGroups) ||
    (state.pivotColumnGroups &&
      state.pivotColumnGroups != oldState?.pivotColumnGroups)
      ? computeColumnGroupsDepths(computedColumnGroups)
      : state.columnGroupsDepthsMap;

  const groupRowsBy = parentState?.groupRowsBy;
  const groupRenderStrategy = getGroupRenderStrategy({
    groupRenderStrategy: props.groupRenderStrategy,
    groupRowsBy,
    groupColumn: props.groupColumn,
  });

  return {
    groupRenderStrategy,
    groupRowsBy,
    computedColumns:
      state.computedPivotColumns ||
      state.columnsWhenGrouping ||
      state.columnsWhenInlineGroupRenderStrategy ||
      state.columns,
    virtualizeHeader,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth:
      columnGroupsDepthsMap != state.columnGroupsDepthsMap
        ? Math.max(...columnGroupsDepthsMap.values(), 0)
        : state.columnGroupsMaxDepth,
    computedColumnGroups,

    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    headerHeightCSSVar:
      typeof props.headerHeight === 'string'
        ? props.headerHeight || '--ITableHeader__height'
        : '',
  };
};
