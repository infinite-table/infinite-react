import * as React from 'react';

import {
  DataSourcePropFilterTypes,
  DataSourceFilterValueItem,
  DataSourceFilterOperator,
} from '../../../DataSource';
import { Renderable } from '../../../types/Renderable';

export {
  InfiniteTableColumnHeaderFilterClassName,
  InfiniteTableColumnHeaderFilterOperatorClassName,
} from './headerFilterClassNames';

export type InfiniteTableColumnHeaderFilterProps<T> = {
  horizontalLayoutPageIndex: null | number;
  filterEditor: React.ComponentType<any>;
  filterOperatorSwitch: React.ComponentType<any>;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  operator?: DataSourceFilterOperator<T>;
  columnLabel: Renderable;
  columnFilterType?: string;
  columnHeaderHeight: number;
  onChange: (value: DataSourceFilterValueItem<T> | null) => void;
};

export const InfiniteTableColumnHeaderFilterContext = React.createContext<
  InfiniteTableColumnHeaderFilterProps<any>
>(null as any as InfiniteTableColumnHeaderFilterProps<any>);
