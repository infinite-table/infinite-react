import { InfiniteTableComputedColumn } from '../..';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { ColumnAndGroupTreeInfo } from './buildColumnAndGroupTree';

export type InfiniteTableHeaderProps<T> = {
  repaintId?: string | number;
  headerBrain: MatrixBrain;
  bodyBrain: MatrixBrain;
  columns: InfiniteTableComputedColumn<T>[];
  columnHeaderHeight: number;
  columnGroupsMaxDepth: number;
  columnAndGroupTreeInfo?: ColumnAndGroupTreeInfo<T>;
};

export type InfiniteTableHeaderGroupProps<T> = {
  bodyBrain: MatrixBrain;
  columns: InfiniteTableComputedColumn<T>[];
  columnGroup: InfiniteTableComputedColumnGroup;
  columnGroupsMaxDepth: number;
  height: number;
  width: number;
  domRef?: React.RefCallback<HTMLElement>;
};
