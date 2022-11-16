import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTableColumnAggregator,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
];

const defaultPivotBy: DataSourcePivotBy<Developer>[] = [
  {
    field: 'stack',
  },
  {
    field: 'canDesign',
    columnGroup: ({ columnGroup }) => {
      return {
        ...columnGroup,
        header:
          columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      };
    },
  },
];

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.round(arr.length ? sum / arr.length : 0),
};

const aggregations: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary',
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        defaultGroupBy={defaultGroupBy}
        defaultPivotBy={defaultPivotBy}
        aggregationReducers={aggregations}
        data={dataSource}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              groupRenderStrategy="single-column"
              columns={columns}
              columnDefaultWidth={200}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="start"
            />
          );
        }}
      </DataSource>
    </>
  );
}
