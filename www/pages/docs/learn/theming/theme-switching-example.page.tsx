import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

export default function App() {
  const [currentTheme, setTheme] = React.useState('light');
  return (
    <div
      className={currentTheme}
      style={{
        display: 'flex',
        flexFlow: 'column',
        flex: 1,
      }}
    >
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee> columns={columns} />
      </DataSource>

      <button
        style={{ marginTop: 'var(--infinite-space-4)' }}
        onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      >
        Switch theme
      </button>
    </div>
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
