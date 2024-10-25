import { TreeSelectionState } from '../../DataSource/TreeSelectionState';
import { InfiniteTableProps } from '../../InfiniteTable/types/InfiniteTableProps';

export type TreeGridOnlyProps<_T> = {};

export type InfiniteTablePropsNotAvailableInTreeGrid = keyof Pick<
  InfiniteTableProps<any>,
  | 'pivotColumns'
  | 'pivotColumnGroups'
  | 'pivotTotalColumnPosition'
  | 'pivotGrandTotalColumnPosition'
  | 'groupColumn'
  | 'groupRenderStrategy'
  | 'hideEmptyGroupColumns'
  | 'showSeparatePivotColumnForSingleAggregation'
  | 'isRowDetailExpanded'
  | 'isRowDetailEnabled'
  | 'rowDetailCache'
  | 'rowDetailState'
  | 'defaultRowDetailState'
  | 'onRowDetailStateChange'
  | 'rowDetailHeight'
  | 'rowDetailRenderer'
  | 'groupRenderStrategy'
>;

export type TreeGridProps<T> = Omit<
  InfiniteTableProps<T>,
  InfiniteTablePropsNotAvailableInTreeGrid
> &
  TreeGridOnlyProps<T>;

export { TreeSelectionState };
