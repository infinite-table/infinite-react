import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  index: {
    renderValue: ({ rowInfo }) => {
      return `${rowInfo.indexInAll}`;
    },
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city', defaultWidth: 3600 },
  currency: { field: 'currency' },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const sinon = require('sinon');

const onColumnSizingChange = sinon.spy((_rowHeight: number) => {});

(globalThis as any).onColumnSizingChange = onColumnSizingChange;

export default () => {
  return (
    <React.StrictMode>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: 500,
              width: 1000,
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={100}
          columnMinWidth={50}
          onColumnSizingChange={onColumnSizingChange}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};
