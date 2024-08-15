// CONFESSION: this should have been named `useVirtualAndHorizontalBrains`
// but I couldn't stand naming it `useYourBrain` instead 🤷‍♂️

import { useMatrixBrain } from '../../HeadlessTable';
import { Size } from '../../types/Size';
import { MatrixBrain, SpanFunction } from '../../VirtualBrain/MatrixBrain';
import { InfiniteTableComputedColumn } from '../types';

type UseYourBrainParam<T = any> = {
  brain: MatrixBrain;

  columnSize: (rowIndex: number) => number;
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];
  computedRowHeight: number | ((index: number) => number);

  dataArray: any[];
  wrapRowsHorizontally: boolean;
  wrapRowsHorizontallyPerPageCount: number;
  wrapRowsHorizontallyPageCount: number;

  bodySize: Size;
  rowspan?: SpanFunction;
  colspan?: SpanFunction;
};
export function useYourBrain<T = any>(param: UseYourBrainParam<T>) {
  const {
    dataArray,
    brain,
    computedPinnedEndColumns,
    computedPinnedStartColumns,
    computedVisibleColumns,
    computedRowHeight,
    columnSize,
    rowspan,

    wrapRowsHorizontally,
    wrapRowsHorizontallyPerPageCount,
    // wrapRowsHorizontallyPageCount,
  } = param;

  const rowHeight = computedRowHeight;

  const rows = wrapRowsHorizontally
    ? wrapRowsHorizontallyPerPageCount
    : // dataArray.length
      dataArray.length;

  let cols = computedVisibleColumns.length;

  if (wrapRowsHorizontally) {
    // cols *= wrapRowsHorizontallyPageCount;
  }

  useMatrixBrain(
    brain,
    {
      colWidth: columnSize,
      rowHeight,
      // don't update width and height here
      // since it's updated by HeadlessTable, to account also for scrollbar sizes
      // height: bodySize.height,
      // width: bodySize.width,
      // rows: dataArray.length,
      rows,
      cols,
      rowspan,
    },
    {
      fixedColsEnd: computedPinnedEndColumns.length,
      fixedColsStart: computedPinnedStartColumns.length,
    },
  );

  return brain;
}
