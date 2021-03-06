import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
} from '@infinite-table/infinite-react';
import { columns, Employee } from './columns';

const groupBy: DataSourcePropGroupBy<Employee> = [
  {
    field: 'age',
    column: {
      renderValue: ({ value }: { value: any }) =>
        `Age: ${value}`,
    },
  },
  {
    field: 'companyName',
  },
];

export default function App() {
  return (
    <DataSource<Employee>
      data={dataSource}
      primaryKey="id"
      groupBy={groupBy}>
      <InfiniteTable<Employee>
        columns={columns}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees10k'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => data);
};
