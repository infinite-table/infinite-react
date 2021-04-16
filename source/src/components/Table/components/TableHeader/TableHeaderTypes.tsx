import { TableComputedColumn } from '../..';
import type { OnResizeFn } from '../../../types/Size';

import { VirtualBrain } from '../../../VirtualBrain';

export type TableHeaderProps<T> = {
  repaintId?: string | number;
  brain: VirtualBrain;
  columns: TableComputedColumn<T>[];
  totalWidth: number;
  onResize?: OnResizeFn;
};

export type TableHeaderUnvirtualizedProps<T> = Omit<
  TableHeaderProps<T>,
  'repaintId' | 'brain'
>;
