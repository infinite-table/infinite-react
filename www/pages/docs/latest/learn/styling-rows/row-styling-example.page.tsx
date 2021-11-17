import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropRowStyle,
} from '@infinite-table/infinite-react';
import '@infinite-table/infinite-react/index.css';
import { columns, Employee } from './columns';

const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
}: {
  data: Employee | null;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }
  return;
};

export default function App() {
  return (
    <DataSource<Employee> data={dataSource} primaryKey="id">
      <InfiniteTable<Employee> columns={columns} rowStyle={rowStyle} />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees100')
    .then((r) => r.json())
    .then((data: Employee[]) => {
      console.log(data);
      return data;
    });
};
