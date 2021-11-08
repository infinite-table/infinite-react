import { createRef } from 'react';
import { DataSourceState } from '../../DataSource';
import { buildSubscriptionCallback } from '../../utils/buildSubscriptionCallback';
import { isControlled } from '../../utils/isControlled';
import { ScrollListener } from '../../VirtualBrain/ScrollListener';
import {
  InfiniteTableProps,
  InfiniteTableState as InfiniteTableDynamicState,
} from '../types';
import { InfiniteTableGeneratedColumns } from '../types/InfiniteTableProps';
import {
  InfiniteTableSetupState,
  InfiniteTableDerivedState,
} from '../types/InfiniteTableState';
import { computeColumnGroupsDepths } from './computeColumnGroupsDepths';

export function setupState(): InfiniteTableSetupState {
  return {
    domRef: createRef(),
    bodyDOMRef: createRef(),
    portalDOMRef: createRef(),

    onRowHeightCSSVarChange: buildSubscriptionCallback<number>(),
    onHeaderHeightCSSVarChange: buildSubscriptionCallback<number>(),
  };
}

// export function initialiseState
export function getInitialState<T>(params: {
  props: InfiniteTableProps<T>;
  parentState: DataSourceState<T>;
}): InfiniteTableDynamicState<T> {
  const { props } = params;

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

  return {
    rowHeightComputed:
      typeof props.rowHeight === 'number' ? props.rowHeight : 0,

    headerHeightComputed:
      typeof props.headerHeight === 'number' ? props.headerHeight : 0,
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
    computedColumns: props.columns,
    pivotColumns,
    pivotColumnGroups,
    generatedColumns,
    hideEmptyGroupColumns: props.hideEmptyGroupColumns ?? false,

    columnOrder:
      (isControlled('columnOrder', props)
        ? props.columnOrder
        : props.defaultColumnOrder) ?? true,
    computedColumnGroups,
    // TODO build a clearState function so we can destroy those when component is unmounted
    // so we don't have memory leaks
    pinnedStartScrollListener: new ScrollListener(),
    pinnedEndScrollListener: new ScrollListener(),
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
    computedPivotColumns: undefined,
  };
}

// TODO implement something like mapPropsToState, since it's not very clear that the properties from
// state that have the same name in props are re-synced into state when the controlled props change

type X = {
  onReady: () => void;
  showZebraRows: boolean;
};

type ForwardPropsFn<X> = () => {
  [k in keyof X]: 1 | ((value: X[k]) => X[k]);
};

const forwardProps: ForwardPropsFn<{
  onReady: number;
  showZebraRows: boolean;
}> = () => {
  return {
    onReady: 1,
    showZebraRows: (value) => value ?? true,
  };
};

export function mapPropsToState<T>(params: {
  props: InfiniteTableProps<T>;
  state: InfiniteTableDynamicState<T>;
  updatedProps: Partial<InfiniteTableProps<T>> | null;
  updatedState: Partial<InfiniteTableDynamicState<T>> | null;
  parentState: DataSourceState<T>;
}): InfiniteTableDerivedState<T> {
  const { props, state, updatedProps } = params;
  const virtualizeColumns = props.virtualizeColumns ?? true;
  const header = props.header ?? true;
  const computedColumnGroups = state.pivotColumnGroups || state.columnGroups;
  const virtualizeHeader =
    header &&
    virtualizeColumns &&
    (!computedColumnGroups || computedColumnGroups?.size === 0);

  const columnGroupsDepthsMap =
    updatedProps?.columnGroups || updatedProps?.pivotColumnGroups
      ? computeColumnGroupsDepths(computedColumnGroups)
      : state.columnGroupsDepthsMap;

  const pivotTotalColumnPosition = props.pivotTotalColumnPosition ?? 'end';

  return {
    //todo continue from here

    groupColumn: props.groupColumn,
    onReady: props.onReady,
    domProps: props.domProps,
    showZebraRows: props.showZebraRows ?? true,
    showHoverRows: props.showHoverRows ?? true,
    virtualizeColumns,
    virtualizeHeader,
    header,
    rowStyle: props.rowStyle,
    rowProps: props.rowProps,
    rowClassName: props.rowClassName,
    pinnedStartMaxWidth: props.pinnedStartMaxWidth,
    pinnedEndMaxWidth: props.pinnedEndMaxWidth,
    groupRenderStrategy: props.groupRenderStrategy ?? 'multi-column',
    pivotTotalColumnPosition,
    columnMinWidth: props.columnMinWidth ?? 30,
    columnMaxWidth: props.columnMaxWidth ?? 2000,
    columnDefaultWidth: props.columnDefaultWidth ?? 300,
    draggableColumns: props.draggableColumns ?? true,
    pivotColumn: props.pivotColumn,
    pivotRowLabelsColumn: props.pivotRowLabelsColumn,
    sortable: props.sortable ?? true,
    columnGroupsDepthsMap,
    columnGroupsMaxDepth: Math.max(...columnGroupsDepthsMap.values(), 0),
    computedColumnGroups: computedColumnGroups,

    licenseKey:
      props.licenseKey || (globalThis as any).InfiniteTableLicenseKey || '',
    rowHeightCSSVar: typeof props.rowHeight === 'string' ? props.rowHeight : '',
    headerHeightCSSVar:
      typeof props.headerHeight === 'string'
        ? props.headerHeight || '--ITableHeader__height'
        : '',
    // headerHeightComputed:
    //   typeof props.headerHeight === 'number'
    //     ? props.headerHeight
    //     : state.headerHeightComputed,
    rowHeightComputed:
      typeof props.rowHeight === 'number'
        ? props.rowHeight
        : state.rowHeightComputed,
    // headerHeight:
    //   typeof props.headerHeight === 'number'
    //     ? props.headerHeight
    //     : state.headerHeightComputed,
  };
}
