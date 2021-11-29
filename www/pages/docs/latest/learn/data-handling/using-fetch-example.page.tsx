import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import { columns, Employee } from './columns';

export default function App() {
  return (
    <DataSource<Employee> data={dataSource} primaryKey="id">
      <InfiniteTable<Employee> columns={columns} />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/employees10k'
  )
    .then((r) => r.json())
    .then((data: Employee[]) => {
      return data;
    });
};
