import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useDataSourceState,
  type InfiniteTableColumn,
  DataSourceState,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  preferredLanguage: string;
  stack: string;
  salary: number;
  currency: string;
  country: string;
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  firstName: { field: 'firstName', header: 'First Name' },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Programming Language',
  },
  stack: { field: 'stack', header: 'Stack' },

  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 210,
  },
  currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
};

const domProps = {
  style: {
    flex: 1,
  },
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultGroupBy={[{ field: 'country' }]}
    >
      <AppGrid />
    </DataSource>
  );
}

function AppGrid() {
  const dataLength = useDataSourceState(
    (state: DataSourceState<Developer>) => state.dataArray.length,
  );
  return (
    <div
      style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        color: 'var(--infinite-cell-color)',
        background: 'var(--infinite-background)',
      }}
    >
      <h1>Your DataGrid</h1>
      <p>
        Displaying {dataLength} rows. Collapse/expand rows to see this number
        change.
      </p>

      <InfiniteTable<Developer>
        groupRenderStrategy="single-column"
        defaultActiveRowIndex={0}
        domProps={domProps}
        columns={columns}
        columnDefaultWidth={150}
      />
    </div>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
