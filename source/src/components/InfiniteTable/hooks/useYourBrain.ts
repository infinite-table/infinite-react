// CONFESSION: this should have been named `useVirtualAndHorizontalBrains`
// but I couldn't stand naming it `useYourBrain` instead 🤷‍♂️

import { useMatrixBrain } from '../../HeadlessTable';
import { Size } from '../../types/Size';

import { MatrixBrain, SpanFunction } from '../../VirtualBrain/MatrixBrain';
import { InfiniteTableComputedColumn } from '../types';
import { useColumnSizeFn } from './useColumnSizeFn';

type UseYourBrainParam<T = any> = {
  brain: MatrixBrain;

  columnSize: (rowIndex: number) => number;
  computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedEndColumns: InfiniteTableComputedColumn<T>[];

  dataArray: any[];
  rowHeight: number;
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
    columnSize,
    rowHeight,
    rowspan,
  } = param;

  useMatrixBrain(
    brain,
    {
      colWidth: columnSize,
      rowHeight,
      // don't update width and height here
      // since it's updated by HeadlessTable, to account also for scrollbar sizes
      // height: bodySize.height,
      // width: bodySize.width,
      rows: dataArray.length,
      cols: computedVisibleColumns.length,
      rowspan,
    },
    {
      fixedColsEnd: computedPinnedEndColumns.length,
      fixedColsStart: computedPinnedStartColumns.length,
    },
  );

  // useEffect(() => {
  //   brain.setAvailableSize({
  //     height: bodySize.height,
  //     width: bodySize.width,
  //   });
  // }, [bodySize, brain]);

  return brain;
}
