import '@infinite-table/infinite-react/index.css';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

const getDataSourceFor = (size: string) => {
  if (size === '0') {
    return () => Promise.resolve([]);
  }
  return () => {
    return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/employees' + size)
      .then((r) => r.json())
      .then((data: Employee[]) => data);
  };
};

export default function App() {
  const [dataSourceSize, setDataSourceSize] = React.useState<string>('10');

  const dataSource = React.useMemo(() => {
    return getDataSourceFor(dataSourceSize);
  }, [dataSourceSize]);
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}
    >
      <p style={{ padding: 10 }}>Please select the size of the datasource:</p>
      <div style={{ padding: 10 }}>
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'currentColor',
            padding: 'var(--infinite-space-3)',
          }}
          value={dataSourceSize}
          onChange={(event) => {
            const newSize = event.target.value as string;

            setDataSourceSize(newSize);
          }}
        >
          <option value="0">no items</option>
          <option value="10">10 items</option>
          <option value="100">100 items</option>
          <option value="1k">1k items</option>
          <option value="10k">10k items</option>
        </select>
      </div>
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee> columns={columns} columnDefaultWidth={150} />
      </DataSource>
    </div>
  );
}
