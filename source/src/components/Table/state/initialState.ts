import { TableProps, TableState } from '../types';

function getInitialState<T>(props: TableProps<T>): TableState<T> {
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
  } as TableState<T>;
}

export { getInitialState };
