import * as React from 'react';

import {
  DataSourcePropFilterTypes,
  DataSourceFilterValueItem,
  DataSourceFilterOperator,
} from '../../../DataSource';
import { Renderable } from '../../../types/Renderable';
import { rootClassName } from '../../internalProps';

export type InfiniteTableColumnHeaderFilterProps<T> = {
  horizontalLayoutPageIndex: null | number;
  filterEditor: () => React.JSX.Element | null;
  filterOperatorSwitch: () => React.JSX.Element | null;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  operator?: DataSourceFilterOperator<T>;
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
