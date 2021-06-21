import type { ReactNode } from 'react';
import type { Renderable } from '../../types/Renderable';
import type { DataSourceSingleSortInfo } from '../../DataSource/types';
import type { DiscriminatedUnion, RequireAtLeastOne } from './Utility';
import { TableEnhancedData } from '.';

export interface TableColumnRenderParams<DATA_TYPE> {
  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | ReactNode | void;
  data: DATA_TYPE | null;
  enhancedData: TableEnhancedData<DATA_TYPE>;
  rowIndex: number;
  column: TableComputedColumn<DATA_TYPE>;
}

export interface TableColumnHeaderRenderParams<T> {
  column: TableComputedColumn<T>;
  columnSortInfo: DataSourceSingleSortInfo<T> | null | undefined;
}

export type TableColumnPinned = 'start' | 'end' | false;

export type TableColumnRenderFunction<DATA_TYPE> = ({
  value,
  rowIndex,
  column,
  data,
  enhancedData,
}: TableColumnRenderParams<DATA_TYPE>) => ReactNode | null;

export type TableColumnHeaderRenderFunction<T> = ({
  columnSortInfo,
  column,
}: TableColumnHeaderRenderParams<T>) => Renderable;

export type TableColumnWithField<T> = {
  field: keyof T;
};

export type TableColumnWithRender<T> = {
  render: TableColumnRenderFunction<T>;
};

export type TableColumnAlign = 'start' | 'center' | 'end';
export type TableColumnVerticalAlign = 'start' | 'center' | 'end';

export type TableColumnHeader<T> =
  | Renderable
  | TableColumnHeaderRenderFunction<T>;

type TableColumnWithFlex = {
  flex?: number;
  defaultFlex?: number;
};

type TableColumnWithWidth = {
  width?: number;
  defaultWidth?: number;
};

type TableColumnWithSize = DiscriminatedUnion<
  TableColumnWithFlex,
  TableColumnWithWidth
>;

export type TableColumnTypes = 'string' | 'number' | 'date';

export type TableColumnWithRenderOrField<T> = RequireAtLeastOne<
  {
    field?: keyof T;
    render?: TableColumnRenderFunction<T>;
  },
  'render' | 'field'
>;
export type TableColumn<T> = {
  maxWidth?: number;
  minWidth?: number;
  type?: TableColumnTypes;

  sortable?: boolean;
  draggable?: boolean;

  align?: TableColumnAlign;
  verticalAlign?: TableColumnVerticalAlign;

  header?: TableColumnHeader<T>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
} & TableColumnWithRenderOrField<T> &
  TableColumnWithSize;

type TableComputedColumnBase<T> = {
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

  computedPinned: TableColumnPinned;
  computedDraggable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  toggleSort: () => void;
  id: string;
};

export type TableComputedColumn<T> = TableColumn<T> &
  TableComputedColumnBase<T>;
