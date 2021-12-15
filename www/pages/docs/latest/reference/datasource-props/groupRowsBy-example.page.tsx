import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupRowsBy,
} from '@infinite-table/infinite-react';

import { columns, Employee } from './columns';

const columnSizing = new Map<string, { width: number }>([
  ['country-group', { width: 250 }],
]);

const groupRowsBy: DataSourcePropGroupRowsBy<Employee> = [
  {
    field: 'country',
    column: {
      id: 'country-group',
      renderValue: ({ value }) => <>Country: {value}</>,
    },
  },
];

export default function App() {
  return (
    <DataSource<Employee>
      data={dataSource}
      primaryKey="id"
      groupRowsBy={groupRowsBy}>
      <InfiniteTable<Employee>
        columns={columns}
        defaultColumnSizing={columnSizing}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees1k'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
