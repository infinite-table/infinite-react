import type { Renderable } from '../../types/Renderable';
import type {
  DataSourceComputedValues,
  DataSourceSingleSortInfo,
} from '../../DataSource/types';
import type { DiscriminatedUnion, RequireAtLeastOne } from './Utility';
import { InfiniteTableEnhancedData } from '.';

export interface InfiniteTableColumnRenderParams<DATA_TYPE> {
  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | Renderable | void;
  data: DATA_TYPE | null;
  enhancedData: InfiniteTableEnhancedData<DATA_TYPE>;
  rowIndex: number;
  column: InfiniteTableComputedColumn<DATA_TYPE>;
  groupBy: DataSourceComputedValues<DATA_TYPE>['groupBy'];
}

export interface InfiniteTableColumnHeaderRenderParams<T> {
  column: InfiniteTableComputedColumn<T>;
  columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
}

export type InfiniteTableColumnPinned = 'start' | 'end' | false;

export type InfiniteTableColumnRenderFunction<DATA_TYPE> = ({
  value,
  rowIndex,
  column,
  data,
  enhancedData,
  groupBy,
}: InfiniteTableColumnRenderParams<DATA_TYPE>) => Renderable | null;

export type InfiniteTableColumnHeaderRenderFunction<T> = ({
  columnSortInfo,
  column,
}: InfiniteTableColumnHeaderRenderParams<T>) => Renderable;

export type InfiniteTableColumnWithField<T> = {
  field: keyof T;
};

export type InfiniteTableColumnWithRender<T> = {
  render: InfiniteTableColumnRenderFunction<T>;
};

export type InfiniteTableColumnAlign = 'start' | 'center' | 'end';
export type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';

export type InfiniteTableColumnHeader<T> =
  | Renderable
  | InfiniteTableColumnHeaderRenderFunction<T>;

type InfiniteTableColumnWithFlex = {
  flex?: number;
  defaultFlex?: number;
};

type InfiniteTableColumnWithWidth = {
  width?: number;
  defaultWidth?: number;
};

type InfiniteTableColumnWithSize = DiscriminatedUnion<
  InfiniteTableColumnWithFlex,
  InfiniteTableColumnWithWidth
>;

export type InfiniteTableColumnTypes = 'string' | 'number' | 'date';

export type InfiniteTableColumnWithRenderOrField<T> = RequireAtLeastOne<
  {
    field?: keyof T;
    render?: InfiniteTableColumnRenderFunction<T>;
  },
  'render' | 'field'
>;
export type InfiniteTableColumn<T> = {
  maxWidth?: number;
  minWidth?: number;
  type?: InfiniteTableColumnTypes;

  sortable?: boolean;
  draggable?: boolean;

  align?: InfiniteTableColumnAlign;
  verticalAlign?: InfiniteTableColumnVerticalAlign;

  header?: InfiniteTableColumnHeader<T>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
} & InfiniteTableColumnWithRenderOrField<T> &
  InfiniteTableColumnWithSize;

type InfiniteTableComputedColumnBase<T> = {
  computedWidth: number;
  computedOffset: number;
  computedPinningOffset: number;
  computedAbsoluteOffset: number;
  computedSortable: boolean;
  computedSortInfo: DataSourceSingleSortInfo<T> | null;
  computedSorted: boolean;
  computedSortedAsc: boolean;
  computedSortedDesc: boolean;
  computedVisibleIndex: number;

  computedPinned: InfiniteTableColumnPinned;
  computedDraggable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  toggleSort: () => void;
  id: string;
};

export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> &
  InfiniteTableComputedColumnBase<T>;
