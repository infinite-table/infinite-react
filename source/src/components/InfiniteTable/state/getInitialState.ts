import { createRef } from 'react';
import { DataSourceState } from '../../DataSource';
import { ForwardPropsToStateFnResult } from '../../hooks/useComponentState';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';

import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import { InfiniteTableProps, InfiniteTableState } from '../types';
import { InfiniteTableGeneratedColumns } from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
  InfiniteTableMappedState,
} from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

/**
 * The computed state is independent from props and cannot
 * be affected by props
 */
export function initSetupState<T>(): InfiniteTableSetupState<T> {
  const generatedColumns: InfiniteTableGeneratedColumns<T> = new Map();

  return {
    columnShifts: null,
    domRef: createRef(),
    bodyDOMRef: createRef(),
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
    generatedColumns,
    draggingColumnId: null,
    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),
    computedPivotColumns: undefined,
  };
}

export const forwardProps = <T>(): ForwardPropsToStateFnResult<
  InfiniteTableProps<T>,
  InfiniteTableMappedState<T>
> => {
  return {
    columns: 1,
    pivotColumns: 1,
    groupColumn: 1,
    onReady: 1,
    domProps: 1,
    rowStyle: 1,
    rowProps: 1,
    rowClassName: 1,
    pinnedStartMaxWidth: 1,
    pinnedEndMaxWidth: 1,
    pivotColumn: 1,
    pivotRowLabelsColumn: 1,
    pivotColumnGroups: 1,

    columnMinWidth: (columnMinWidth) => columnMinWidth ?? 30,
    columnMaxWidth: (columnMaxWidth) => columnMaxWidth ?? 2000,
    columnDefaultWidth: (columnDefaultWidth) => columnDefaultWidth ?? 300,
    draggableColumns: (draggableColumns) => draggableColumns ?? true,

    sortable: (sortable) => sortable ?? true,
    hideEmptyGroupColumns: (hideEmptyGroupColumns) =>
      hideEmptyGroupColumns ?? false,

    pivotTotalColumnPosition: (pivotTotalColumnPosition) =>
      pivotTotalColumnPosition ?? 'end',
    groupRenderStrategy: (groupRenderStrategy) =>
      groupRenderStrategy ?? 'multi-column',

    licenseKey: (licenseKey) =>
      licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',

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
    columnAggregations: (columnAggregations) => columnAggregations ?? new Map(),

    collapsedColumnGroups: (collapsedColumnGroups) =>
      collapsedColumnGroups ?? new Map(),
    columnGroups: (columnGroups) => columnGroups ?? new Map(),
  };
};

export const mapPropsToState = <T>(params: {
  props: InfiniteTableProps<T>;
  state: InfiniteTableState<T>;
  oldState: InfiniteTableState<T> | null;
  parentState: DataSourceState<T>;
}): InfiniteTableDerivedState<T> => {
  const { props, state, oldState } = params;
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

  return {
    computedColumns: state.computedPivotColumns || props.columns,
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
