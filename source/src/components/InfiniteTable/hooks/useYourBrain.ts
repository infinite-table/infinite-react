// CONFESSION: this should have been named `useVirtualAndHorizontalBrains`
// but I couldn't stand naming it `useYourBrain` instead 🤷‍♂️

import { useEffect } from 'react';
import { Size } from '../../types/Size';
import { VirtualBrain, VirtualBrainOptions } from '../../VirtualBrain';
import { InfiniteTableComputedColumn } from '../types';
import { useColumnSizeFn } from './useColumnSizeFn';

type UseYourBrainParam<T = any> = {
  horizontalVirtualBrain: VirtualBrain;
  verticalVirtualBrain: VirtualBrain;
  computedUnpinnedColumns: InfiniteTableComputedColumn<T>[];
  computedPinnedStartWidth: number;
  computedPinnedEndWidth: number;
  dataArray: any[];
  rowHeight: number;
  bodySize: Size;
  rowSpan?: VirtualBrainOptions['itemSpan'];
};
export function useYourBrain<T = any>(param: UseYourBrainParam<T>) {
  const {
    dataArray,
    horizontalVirtualBrain,
    verticalVirtualBrain,
    computedUnpinnedColumns,
    computedPinnedStartWidth,
    computedPinnedEndWidth,
    rowHeight,
    bodySize,
    rowSpan,
  } = param;
  const columnSize = useColumnSizeFn<T>(computedUnpinnedColumns);

  horizontalVirtualBrain.update(
    computedUnpinnedColumns.length,
    // no need to have columnSize as a dep
    // as it only uses computed.columns
    columnSize,
  );

  verticalVirtualBrain.update(dataArray.length, rowHeight, rowSpan);

  if (__DEV__) {
    (globalThis as any).verticalVirtualBrain = verticalVirtualBrain;
    (globalThis as any).horizontalVirtualBrain = horizontalVirtualBrain;
  }

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
        bodySize.width - computedPinnedStartWidth - computedPinnedEndWidth,
        0,
      ),
    });
  }, [bodySize.width, computedPinnedStartWidth, computedPinnedEndWidth]);

  return { horizontalVirtualBrain, verticalVirtualBrain };
}
