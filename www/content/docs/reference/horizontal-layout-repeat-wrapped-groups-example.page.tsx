import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource: DataSourceData<Developer> = () => {
  return fetch(
    'https://infinite-table.com/.netlify/functions/json-server' +
      `/developers1k-sql?`,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', header: 'ID', defaultWidth: 50 },

  country: { field: 'country', header: 'Country' },
  city: { field: 'city', header: 'City' },
  firstName: { field: 'firstName', header: 'First Name' },
  separator: {
    valueGetter: () => null,
    defaultWidth: 10,
    style: {
      background: 'var(--infinite-background)',
    },
  },
};

export default function HorizontalLayout() {
  const [repeatWrappedGroupRows, setRepeatWrappedGroupRows] =
    React.useState(false);
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => {
            setRepeatWrappedGroupRows(!repeatWrappedGroupRows);
          }}
        >
          {repeatWrappedGroupRows ? 'Disable' : 'Enable'} Repeat Wrapped Group
          Rows
        </button>
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultGroupBy={[
          {
            field: 'country',
          },
          {
            field: 'city',
          },
        ]}
      >
        <InfiniteTable<Developer>
          wrapRowsHorizontally
          repeatWrappedGroupRows={repeatWrappedGroupRows}
          columns={columns}
          columnDefaultWidth={100}
          columnDefaultSortable={false}
        />
      </DataSource>
    </>
  );
}
