import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

import developers100 from './developers100';

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  currency: { field: 'currency' },
};

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<Developer>
        data={developers100 as Developer[]}
        primaryKey="id"
      >
        <InfiniteTable<Developer>
          rowHeight={'--row-height'}
          domProps={{
            style: {
              //@ts-ignore
              '--row-height': '40px',
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
