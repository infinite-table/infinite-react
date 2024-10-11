import '@infinite-table/infinite-react/index.css';
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
  firstName: { field: 'firstName', header: 'First Name' },
  age: { field: 'age', header: 'Age' },
};

export default function HorizontalLayout() {
  const [wrapRowsHorizontally, setWrapRowsHorizontally] = React.useState(false);
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
            setWrapRowsHorizontally(!wrapRowsHorizontally);
          }}
        >
          {wrapRowsHorizontally ? 'Disable' : 'Enable'} Horizontal Layout
        </button>
      </div>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          wrapRowsHorizontally={wrapRowsHorizontally}
          columns={columns}
          columnDefaultWidth={100}
          columnDefaultSortable={false}
        />
      </DataSource>
    </>
  );
}
