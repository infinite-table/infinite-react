import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import '@infinite-table/infinite-react/theme/minimalist.css';
import '@infinite-table/infinite-react/theme/ocean.css';
import '@infinite-table/infinite-react/theme/balsam.css';
import '@infinite-table/infinite-react/theme/shadcn.css';

import { columns, Employee } from './columns';

type ThemeName = 'default' | 'minimalist' | 'ocean' | 'balsam' | 'shadcn';

export default function App() {
  const [currentThemeMode, setThemeMode] = React.useState<'light' | 'dark'>(
    'dark',
  );
  const [currentThemeName, setThemeName] =
    React.useState<ThemeName>('minimalist');
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
      <div
        style={{
          display: 'flex',
          flexFlow: 'row',
          alignItems: 'center',
          gap: 10,
          padding: 10,
        }}
      >
        Select theme
        <select
          title="Select theme"
          value={currentThemeName}
          onChange={(e) => setThemeName(e.target.value as ThemeName)}
        >
          <option value="shadcn">Shadcn</option>
          <option value="ocean">Ocean</option>
          <option value="balsam">Balsam</option>
          <option value="minimalist">Minimalist</option>
          <option value="default">Default</option>
        </select>
        <button
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
