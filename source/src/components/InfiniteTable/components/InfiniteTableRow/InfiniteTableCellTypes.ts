import { CSSProperties } from 'react';
import { InfiniteTableComputedColumn } from '../..';

import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import {
  InfiniteTableEnhancedData,
  InfiniteTablePropGroupRenderStrategy,
} from '../../types';
import { InfiniteTableToggleGroupRowFn } from '../../types/InfiniteTableColumn';

export interface InfiniteTableCellProps<T> {
  column: InfiniteTableComputedColumn<T>;

  cssEllipsis?: boolean;
  children: Renderable;
  virtualized?: boolean;
  skipColumnShifting?: boolean;
  beforeChildren?: Renderable;
  afterChildren?: Renderable;

  offset?: number;
  offsetProperty?: 'left' | 'right';
  cssPosition?: CSSProperties['position'];
  domRef?: React.RefCallback<HTMLElement>;
}

export interface InfiniteTableColumnCellProps<T>
  extends Omit<InfiniteTableCellProps<T>, 'children'> {
  virtualized: boolean;
  hidden: boolean;
  enhancedData: InfiniteTableEnhancedData<T>;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  getData: () => InfiniteTableEnhancedData<T>[];
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  rowIndex: number;
  rowHeight: number;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<InfiniteTableCellProps<T>, 'children'> {
  columns: Map<string, InfiniteTableComputedColumn<T>>;
  headerHeight: number;
  onResize?: OnResizeFn;
}
