import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

const columnSizing: Record<string, { width: number }> = {
  'country-group': { width: 250 },
};

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'country',
    column: {
      id: 'country-group',
      renderValue: ({ data }) => <>Country: {data?.country}!</>,
    },
  },
];

const reducers: DataSourcePropAggregationReducers<Employee> = {
  avgSalary: {
    reducer: (acc, value) => acc + value,
    done: (sum, arr) => Math.floor(arr.length ? sum / arr.length : 0),
    field: 'salary',
    initialValue: 0,
  },
};

export default function App() {
  return (
    <DataSource<Employee>
      data={dataSource}
      primaryKey="id"
      aggregationReducers={reducers}
      groupBy={groupBy}
    >
      <InfiniteTable<Employee>
        columns={columns}
        defaultColumnSizing={columnSizing}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees1k')
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
