import { isControlled } from '../../utils/isControlled';
import { InfiniteTableProps, InfiniteTableState } from '../types';

function getInitialState<T>(
  props: InfiniteTableProps<T>,
): InfiniteTableState<T> {
  return {
    // viewportSize: {
    //   width: 0,
    //   height: 0,
    // },
    bodySize: {
      width: 0,
      height: 0,
    },
    scrollPosition: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    draggingColumnId: null,
    columnOrder: isControlled('columnOrder', props)
      ? props.columnOrder
      : props.defaultColumnOrder ?? true,
    columnVisibility: isControlled('columnVisibility', props)
      ? props.columnVisibility
      : props.defaultColumnVisibility ?? new Map(),
    columnPinning: isControlled('columnPinning', props)
      ? props.columnPinning
      : props.defaultColumnPinning ?? new Map(),
    columnAggregations: isControlled('columnAggregations', props)
      ? props.columnAggregations
      : props.defaultColumnAggregations ?? new Map(),
    columnShifts: null,
  } as InfiniteTableState<T>;
}

export { getInitialState };
