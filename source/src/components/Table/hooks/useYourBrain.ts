// CONFESSION: this should have been named `useVirtualAndHorizontalBrains`
// but I couldn't stand naming it `useYourBrain` instead 🤷‍♂️

import { useEffect } from 'react';
import { useOnce } from '../../hooks/useOnce';
import { Size } from '../../types/Size';
import { VirtualBrain } from '../../VirtualBrain';
import { TableComputedColumn } from '../types';
import { useColumnSizeFn } from './useColumnSizeFn';

type UseYourBrainParam = {
  computedUnpinnedColumns: TableComputedColumn<any>[];
  computedPinnedStartColumnsWidth: number;
  computedPinnedEndColumnsWidth: number;
  dataArray: any[];
  rowHeight: number;
  bodySize: Size;
};
export const useYourBrain = (param: UseYourBrainParam) => {
  const {
    dataArray,
    computedUnpinnedColumns,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
    rowHeight,
    bodySize,
  } = param;
  const columnSize = useColumnSizeFn(computedUnpinnedColumns);

  const horizontalVirtualBrain = useOnce<VirtualBrain>(() => {
    const brain = new VirtualBrain({
      count: computedUnpinnedColumns.length,
      // no need to have columnSize as a dep
      // as it only uses computed.columns
      itemSize: columnSize,
      mainAxis: 'horizontal',
    });

    return brain;
  });

  const verticalVirtualBrain = useOnce<VirtualBrain>(() => {
    const brain = new VirtualBrain({
      count: dataArray.length,
      itemSize: rowHeight,
      mainAxis: 'vertical',
    });

    return brain;
  });

  horizontalVirtualBrain.update(
    computedUnpinnedColumns.length,
    // no need to have columnSize as a dep
    // as it only uses computed.columns
    columnSize,
  );
  verticalVirtualBrain.update(dataArray.length, rowHeight);

  useEffect(() => {
    verticalVirtualBrain.setAvailableSize({
      height: bodySize.height,
      width: 0,
    });
  }, [bodySize, verticalVirtualBrain]);

  useEffect(() => {
    horizontalVirtualBrain.setAvailableSize({
      height: 0,
      width: Math.max(
        bodySize.width -
          computedPinnedStartColumnsWidth -
          computedPinnedEndColumnsWidth,
        0,
      ),
    });
  }, [
    bodySize.width,
    computedPinnedStartColumnsWidth,
    computedPinnedEndColumnsWidth,
  ]);

  return { horizontalVirtualBrain, verticalVirtualBrain };
};
