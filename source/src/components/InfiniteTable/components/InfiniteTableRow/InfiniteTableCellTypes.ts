import { CSSProperties } from 'react';
import { InfiniteTableComputedColumn } from '../..';

import { Renderable } from '../../../types/Renderable';
import { OnResizeFn } from '../../../types/Size';
import { InfiniteTableEnhancedData } from '../../types';

export interface InfiniteTableCellProps<T> {
  column: InfiniteTableComputedColumn<T>;

  cssEllipsis?: boolean;
  children: Renderable;
  virtualized?: boolean;
  skipColumnShifting?: boolean;
  outerChildren?: Renderable;
  offset?: number;
  offsetProperty?: 'left' | 'right';
  cssPosition?: CSSProperties['position'];
  domRef?: React.RefCallback<HTMLElement>;
}

export interface InfiniteTableColumnCellProps<T>
  extends Omit<InfiniteTableCellProps<T>, 'children'> {
  virtualized: boolean;
  enhancedData: InfiniteTableEnhancedData<T>;
  rowIndex: number;
}

export interface InfiniteTableHeaderCellProps<T>
  extends Omit<InfiniteTableCellProps<T>, 'children'> {
  columns: Map<string, InfiniteTableComputedColumn<T>>;
  onResize?: OnResizeFn;
}
