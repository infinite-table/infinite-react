import { InfiniteTableComputedColumn } from '../..';
import type { OnResizeFn } from '../../../types/Size';

import { VirtualBrain } from '../../../VirtualBrain';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  brain: VirtualBrain;
  columns: InfiniteTableComputedColumn<T>[];
  totalWidth: number;
  onResize?: OnResizeFn;
};

export type InfiniteTableHeaderUnvirtualizedProps<T> = Omit<
  InfiniteTableHeaderProps<T>,
  'repaintId' | 'brain'
>;
