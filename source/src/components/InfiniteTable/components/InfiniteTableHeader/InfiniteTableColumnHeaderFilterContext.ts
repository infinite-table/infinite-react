import React from 'react';
import {
  DataSourcePropFilterTypes,
  DataSourceFilterValueItem,
} from '../../../DataSource';
import { Renderable } from '../../../types/Renderable';
import { rootClassName } from '../../internalProps';

export type InfiniteTableColumnHeaderFilterProps<T> = {
  filterEditor: () => JSX.Element | null;
  filterOperator: () => JSX.Element | null;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  columnLabel: Renderable;
  columnFilterType?: string;
  columnHeaderHeight: number;
  onChange: (value: DataSourceFilterValueItem<T> | null) => void;
};

export const InfiniteTableColumnHeaderFilterClassName = `${rootClassName}HeaderCell__filter`;
export const InfiniteTableColumnHeaderFilterOperatorClassName = `${rootClassName}HeaderCell__filterOperator`;

export const InfiniteTableColumnHeaderFilterContext = React.createContext<
  InfiniteTableColumnHeaderFilterProps<any>
>(null as any as InfiniteTableColumnHeaderFilterProps<any>);
