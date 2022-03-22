import type { Renderable } from '../../types/Renderable';

import type {
  ColumnTypeWithInherit,
  DataSourcePivotBy,
  DataSourceSingleSortInfo,
  DataSourceState,
} from '../../DataSource/types';
import type { DiscriminatedUnion, RequireAtLeastOne } from './Utility';
import type { InfiniteTableColumnGroup, InfiniteTableRowInfo } from '.';

import { CSSProperties, HTMLProps } from 'react';
import {
  AggregationReducer,
  InfiniteTableRowInfoGroup,
  InfiniteTableRowInfoNormal,
  PivotBy,
} from '../../../utils/groupAndPivot';
import { InfiniteTableColumnPinnedValues } from './InfiniteTableProps';
import { InfiniteTableCellProps } from '../components/InfiniteTableRow/InfiniteTableCellTypes';

export type { DiscriminatedUnion, RequireAtLeastOne };

export type InfiniteTableToggleGroupRowFn = (groupKeys: any[]) => void;

export type InfiniteTableColumnHeaderParams<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  domRef: InfiniteTableCellProps<DATA_TYPE>['domRef'];
  sortTool: JSX.Element;
  column: COL_TYPE;
  columnSortInfo: DataSourceSingleSortInfo<DATA_TYPE> | null;
};

export type InfiniteTableColumnRenderParams<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  domRef: InfiniteTableCellProps<DATA_TYPE>['domRef'];
  // TODO type this to be the type of DATA_TYPE[column.field] if possible
  value: string | number | Renderable;
  groupRowInfo: InfiniteTableRowInfo<DATA_TYPE> | null;
  rowIndex: number;
  column: COL_TYPE;
  toggleCurrentGroupRow: () => void;
  toggleGroupRow: InfiniteTableToggleGroupRowFn;
  groupBy: DataSourceState<DATA_TYPE>['groupBy'];
  pivotBy?: DataSourceState<DATA_TYPE>['pivotBy'];
} & (
  | { rowInfo: InfiniteTableRowInfoNormal<DATA_TYPE>; data: DATA_TYPE }
  | {
      rowInfo: InfiniteTableRowInfoGroup<DATA_TYPE>;
      data: Partial<DATA_TYPE> | null;
    }
);

export type InfiniteTableColumnCellContextType<DATA_TYPE> =
  InfiniteTableColumnRenderParams<DATA_TYPE> & {};
export type InfiniteTableHeaderCellContextType<DATA_TYPE> =
  InfiniteTableColumnHeaderParams<DATA_TYPE> & {};

export type InfiniteTableGroupColumnRenderIconParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderParams<DATA_TYPE, COL_TYPE> & {
  collapsed: boolean;
  groupIcon: Renderable;
  // groupRowInfo: InfiniteTableRowInfoGroup<DATA_TYPE>;
  // data: Partial<DATA_TYPE> | null;
};

export type InfiniteTableColumnRenderValueParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderParams<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnRowspanParam<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = {
  rowInfo: InfiniteTableRowInfo<DATA_TYPE>;
  data: DATA_TYPE | Partial<DATA_TYPE> | null;
  dataArray: InfiniteTableRowInfo<DATA_TYPE>[];
  rowIndex: number;
  column: COL_TYPE;
};

export type InfiniteTableColumnRenderFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = ({
  value,
  rowIndex,
  column,
  data,
  toggleGroupRow,
  toggleCurrentGroupRow,
  rowInfo,
  groupBy,
  pivotBy,
}: InfiniteTableColumnRenderParams<DATA_TYPE, COL_TYPE>) => Renderable | null;

export type InfiniteTableGroupColumnRenderIconFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = (
  param: InfiniteTableGroupColumnRenderIconParam<DATA_TYPE, COL_TYPE>,
) => Renderable | null;

export type InfiniteTableColumnRenderValueFunction<
  DATA_TYPE,
  COL_TYPE = InfiniteTableComputedColumn<DATA_TYPE>,
> = InfiniteTableColumnRenderFunction<DATA_TYPE, COL_TYPE>;

export type InfiniteTableColumnHeaderRenderFunction<T> = ({
  columnSortInfo,
  column,
}: InfiniteTableColumnHeaderParams<T>) => Renderable;

export type InfiniteTableColumnWithField<T> = {
  field: keyof T;
};

export type InfiniteTableColumnWithRender<T> = {
  render: InfiniteTableColumnRenderFunction<T>;
};
export type InfiniteTableColumnWithRenderValue<T> = {
  renderValue: InfiniteTableColumnRenderFunction<T>;
};

export type InfiniteTableColumnAlign = 'start' | 'center' | 'end';
export type InfiniteTableColumnVerticalAlign = 'start' | 'center' | 'end';

export type InfiniteTableColumnHeader<T> =
  | Renderable
  | InfiniteTableColumnHeaderRenderFunction<T>;

export type InfiniteTableColumnTypeNames =
  | 'string'
  | 'number'
  | 'date'
  | string;

// field|valueGetter => THE_VALUE
// |
// \/
export type InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<T> =
  RequireAtLeastOne<
    {
      /**
       * Determines the field property of the column.
       */
      field?: keyof T;
      render?: InfiniteTableColumnRenderFunction<T>;
      renderValue?: InfiniteTableColumnRenderFunction<T>;
      valueGetter?: InfiniteTableColumnValueGetter<T>;
    },
    'render' | 'renderValue' | 'field' | 'valueGetter'
  >;

export type InfiniteTableColumnStyleFnParams<T> = {
  value: Renderable;
  column: InfiniteTableColumn<T>;
} & (
  | {
      data: T;
      rowInfo: InfiniteTableRowInfoNormal<T>;
    }
  | {
      data: Partial<T> | null;
      rowInfo: InfiniteTableRowInfoGroup<T>;
    }
);
export type InfiniteTableColumnStyleFn<T> = (
  params: InfiniteTableColumnStyleFnParams<T>,
) => undefined | React.CSSProperties;

export type InfiniteTableColumnClassNameFn<T> = (
  params: InfiniteTableColumnStyleFnParams<T>,
) => undefined | string;

export type InfiniteTableColumnStyle<T> =
  | CSSProperties
  | InfiniteTableColumnStyleFn<T>;
export type InfiniteTableColumnClassName<T> =
  | string
  | InfiniteTableColumnClassNameFn<T>;

export type InfiniteTableColumnValueGetterParams<T> =
  | {
      data: T;
      rowInfo: InfiniteTableRowInfoNormal<T>;
    }
  | {
      data: Partial<T> | null;
      rowInfo: InfiniteTableRowInfoGroup<T>;
    };
export type InfiniteTableColumnValueGetter<
  T,
  VALUE_GETTER_TYPE = string | number | boolean | null | undefined,
> = (params: InfiniteTableColumnValueGetterParams<T>) => VALUE_GETTER_TYPE;

export type InfiniteTableColumnRowspanFn<T> = (
  params: InfiniteTableColumnRowspanParam<T>,
) => number;

export type InfiniteTableColumnComparer<T> = (a: T, b: T) => number;

export type InfiniteTableBaseColumn<T> = {
  sortable?: boolean;
  draggable?: boolean;
  resizable?: boolean;

  comparer?: InfiniteTableColumnComparer<T>;
  defaultHiddenWhenGroupedBy?:
    | '*'
    | keyof T
    | { [k in keyof Partial<T>]: true };

  align?: InfiniteTableColumnAlign;
  verticalAlign?: InfiniteTableColumnVerticalAlign;
  columnGroup?: string;

  header?: InfiniteTableColumnHeader<T>;
  name?: Renderable;
  cssEllipsis?: boolean;
  headerCssEllipsis?: boolean;
  type?: InfiniteTableColumnTypeNames | InfiniteTableColumnTypeNames[] | null;

  style?: InfiniteTableColumnStyle<T>;
  className?: InfiniteTableColumnClassName<T>;

  rowspan?: InfiniteTableColumnRowspanFn<T>;

  valueGetter?: InfiniteTableColumnValueGetter<T>;

  defaultWidth?: number;
  defaultFlex?: number;
  minWidth?: number;
  maxWidth?: number;

  components?: {
    ColumnCell?: React.FunctionComponent<HTMLProps<HTMLDivElement>>;
    HeaderCell?: React.FunctionComponent<HTMLProps<HTMLDivElement>>;
  };
};

/**
 * Defines a column in the table.
 *
 * @typeParam DATA_TYPE The type of the data in the table.
 *
 * Can be bound to a field which is a `keyof DATA_TYPE`.
 */
export type InfiniteTableColumn<DATA_TYPE> =
  {} & InfiniteTableBaseColumn<DATA_TYPE> &
    InfiniteTableColumnWithRenderOrRenderValueOrFieldOrValueGetter<DATA_TYPE>;

export type InfiniteTableGeneratedGroupColumn<T> = InfiniteTableColumn<T> & {
  groupByField: string | string[];
  id?: string;
};

export type InfiniteTablePivotColumn<T> = InfiniteTableColumn<T> &
  ColumnTypeWithInherit<Partial<InfiniteTablePivotFinalColumnVariant<T, any>>>;

export type InfiniteTablePivotFinalColumnGroup<
  DataType,
  KeyType extends any = any,
> = InfiniteTableColumnGroup & {
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotTotalColumnGroup?: true;
  pivotGroupKeys: KeyType[];
  pivotByAtIndex: PivotBy<DataType, KeyType>;
  pivotGroupKey: KeyType;
  pivotIndex: number;
};
export type InfiniteTablePivotFinalColumn<
  DataType,
  KeyType extends any = any,
> = InfiniteTableColumn<DataType> & {
  pivotBy: DataSourcePivotBy<DataType>[];
  pivotColumn: true;
  pivotTotalColumn: boolean;
  pivotAggregator: AggregationReducer<DataType, any>;
  pivotAggregatorIndex: number;

  pivotGroupKeys: KeyType[];
  pivotByAtIndex?: PivotBy<DataType, KeyType>;
  pivotIndex: number;
  pivotGroupKey: KeyType;
};

export type InfiniteTablePivotFinalColumnVariant<
  DataType,
  KeyType extends any = any,
> = InfiniteTablePivotFinalColumn<DataType, KeyType>;
// export type InfiniteTablePivotFinalColumnVariant<
//   DataType,
//   KeyType extends any = any,
// > = Omit<InfiniteTablePivotFinalColumn<DataType, KeyType>, 'pivotByAtIndex'> & {
//   pivotByAtIndex?: PivotBy<DataType, KeyType>;
// };

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
  computedSortIndex: number;
  computedVisibleIndex: number;
  computedMultiSort: boolean;

  computedPinned: InfiniteTableColumnPinnedValues;
  computedDraggable: boolean;
  computedFirstInCategory: boolean;
  computedLastInCategory: boolean;
  computedFirst: boolean;
  computedLast: boolean;
  toggleSort: () => void;
  id: string;
};

export type InfiniteTableComputedColumn<T> = InfiniteTableColumn<T> &
  InfiniteTableComputedColumnBase<T> &
  Partial<InfiniteTablePivotFinalColumn<T>> &
  Partial<InfiniteTableGeneratedGroupColumn<T>>;

export type InfiniteTableComputedPivotFinalColumn<T> =
  InfiniteTableComputedColumn<T> & InfiniteTablePivotFinalColumn<T>;
