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
    columnOrder: props.defaultColumnOrder ?? true,
    columnVisibility: props.defaultColumnVisibility ?? new Map(),
    columnPinning: props.defaultColumnPinning ?? new Map(),
    columnShifts: null,
  } as InfiniteTableState<T>;
}

export { getInitialState };
