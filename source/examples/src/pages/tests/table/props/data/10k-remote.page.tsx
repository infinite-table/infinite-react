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

  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export default function DataTestPage() {
  return (
    <React.StrictMode>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnPinning={{
            age: 'start',
            canDesign: 'end',
          }}
          columnDefaultWidth={100}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
