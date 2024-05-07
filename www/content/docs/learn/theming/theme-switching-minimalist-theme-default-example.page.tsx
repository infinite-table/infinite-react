import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, Employee } from './columns';

export default function App() {
  const [currentThemeMode, setThemeMode] = React.useState<'light' | 'dark'>(
    'dark',
  );
  const [currentThemeName, setThemeName] = React.useState<
    'default' | 'minimalist'
  >('minimalist');
  return (
    <div
      className={`infinite-theme-mode--${currentThemeMode} infinite-theme-name--${currentThemeName}`}
      style={{
        display: 'flex',
        flexFlow: 'column',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        background: 'var(--infinite-background)',
      }}
    >
      <DataSource<Employee> data={dataSource} primaryKey="id">
        <InfiniteTable<Employee> columns={columns} />
      </DataSource>

      <div style={{ margin: 10 }}>
        Current settings: <b>{currentThemeName}</b> theme,{' '}
        <b>{currentThemeMode}</b> mode.
      </div>
      <div style={{ display: 'flex', flexFlow: 'row', gap: 10, padding: 10 }}>
        <button
          style={{ marginTop: 'var(--infinite-space-4)' }}
          onClick={() =>
            setThemeName(
              currentThemeName === 'default' ? 'minimalist' : 'default',
            )
          }
        >
          Switch to {currentThemeName === 'default' ? 'minimalist' : 'default'}{' '}
          theme.
        </button>
        <button
          style={{ marginTop: 'var(--infinite-space-4)' }}
          onClick={() =>
            setThemeMode(currentThemeMode === 'dark' ? 'light' : 'dark')
          }
        >
          Switch to {currentThemeMode === 'dark' ? 'light' : 'dark'} mode.
        </button>
      </div>
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
