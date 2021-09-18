import { createRef } from 'react';
import { DataSourceState } from '../../DataSource';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { isControlled } from '../../utils/isControlled';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import { InfiniteTableGeneratedColumns } from '../types/InfiniteTableProps';
import { InfiniteTableReadOnlyState } from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';
import { getComputedPivotColumns } from './getComputedPivotColumns';

export function getInitialState<T>(params: {
  props: InfiniteTableProps<T>;
  parentState: DataSourceState<T>;
}): InfiniteTableState<T> {
  const { props, parentState: dataSourceState } = params;

  const columnGroups =
    (isControlled('columnGroups', props)
      ? props.columnGroups
      : props.defaultColumnGroups) ?? new Map();
  const pivotColumnGroups = props.pivotColumnGroups;

  const collapsedColumnGroups =
    (isControlled('collapsedColumnGroups', props)
      ? props.collapsedColumnGroups
      : props.defaultCollapsedColumnGroups) ?? new Map();

  const computedColumnGroups = pivotColumnGroups || columnGroups;

  const columnGroupsDepthsMap = computeColumnGroupsDepths(computedColumnGroups);

  const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();
  const pivotColumns = props.pivotColumns;

  const pivotTotalColumnPosition = props.pivotTotalColumnPosition ?? 'end';

  return {
    rowHeight: typeof props.rowHeight === 'number' ? props.rowHeight : 0,
    headerHeight:
      typeof props.headerHeight === 'number' ? props.headerHeight : 0,
    domRef: createRef(),
    bodyDOMRef: createRef(),
    portalDOMRef: createRef(),
    bodySizeRef: createRef(),

    onRowHeightChange: buildSubscriptionCallback<number>(),
    onHeaderHeightChange: buildSubscriptionCallback<number>(),

    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    draggingColumnId: null,
    columns: props.columns,
    pivotColumns,
    pivotColumnGroups,
    generatedColumns,

    columnOrder:
      (isControlled('columnOrder', props)
        ? props.columnOrder
        : props.defaultColumnOrder) ?? true,
    computedColumnGroups,
    columnGroups,
    collapsedColumnGroups,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth: Math.max(...columnGroupsDepthsMap.values(), 0),
    columnVisibility:
      (isControlled('columnVisibility', props)
        ? props.columnVisibility
        : props.defaultColumnVisibility) ?? new Map(),
    columnPinning:
      (isControlled('columnPinning', props)
        ? props.columnPinning
        : props.defaultColumnPinning) ?? new Map(),
    columnAggregations:
      (isControlled('columnAggregations', props)
        ? props.columnAggregations
        : props.defaultColumnAggregations) ?? new Map(),
    columnShifts: null,
    computedPivotColumns: getComputedPivotColumns(pivotColumns, {
      pivotColumn: props.pivotColumn,
      pivotBy: dataSourceState.pivotBy!,
      pivotTotalColumnPosition,
      groupRowsBy: dataSourceState.groupRowsBy,
    }),
  };
}

export function deriveReadOnlyState<T>(params: {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  updated: Partial<InfiniteTableState<T>> | null;
  parentState: DataSourceState<T>;
}): InfiniteTableReadOnlyState<T> {
  const { props, state, updated, parentState: dataSourceState } = params;
  const virtualizeColumns = props.virtualizeColumns ?? true;
  const header = props.header ?? true;
  const computedColumnGroups = state.pivotColumnGroups || state.columnGroups;
  const virtualizeHeader =
    header &&
    virtualizeColumns &&
    (!computedColumnGroups || computedColumnGroups?.size === 0);

  const columnGroupsDepthsMap =
    updated?.columnGroups || updated?.pivotColumnGroups
      ? computeColumnGroupsDepths(computedColumnGroups)
      : state.columnGroupsDepthsMap;

  const pivotTotalColumnPosition = props.pivotTotalColumnPosition ?? 'end';
  const computedPivotColumns = updated?.pivotColumns
    ? getComputedPivotColumns(updated?.pivotColumns, {
        pivotColumn: props.pivotColumn,
        groupRowsBy: dataSourceState.groupRowsBy,
        pivotBy: dataSourceState.pivotBy!,
        pivotTotalColumnPosition,
      })
    : state.computedPivotColumns;

  return {
    computedPivotColumns,
    groupColumn: props.groupColumn,
    onReady: props.onReady,
    domProps: props.domProps,
    showZebraRows: props.showZebraRows ?? true,
    virtualizeColumns,
    virtualizeHeader,
    header,
    rowStyle: props.rowStyle,
    rowProps: props.rowProps,
    rowClassName: props.rowClassName,
    groupRenderStrategy: props.groupRenderStrategy ?? 'multi-column',
    pivotTotalColumnPosition,
    columnMinWidth: props.columnMinWidth ?? 30,
    columnMaxWidth: props.columnMaxWidth ?? 2000,
    columnDefaultWidth: props.columnDefaultWidth ?? 300,
    draggableColumns: props.draggableColumns ?? true,
    sortable: props.sortable ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth: Math.max(...columnGroupsDepthsMap.values(), 0),
    computedColumnGroups: computedColumnGroups,

    licenseKey:
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    headerHeightCSSVar:
      typeof props.headerHeight === 'string' ? props.headerHeight : '',
  };
}
