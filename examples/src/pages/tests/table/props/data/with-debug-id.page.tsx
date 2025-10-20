import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { useState } from 'react';

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

const dataSource: () => Promise<Developer[]> = () => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => {
      // random delay between 100 and 1000ms
      const delay = Math.floor(Math.random() * 900) + 100;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, delay);
      });
    });
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

  currency: { field: 'currency' },
};

export default function DataTestPage() {
  const [data, setData] = useState<typeof dataSource>(() => dataSource);
  return (
    <>
      <button
        onClick={() => {
          setData(() => dataSource.bind(null));
        }}
      >
        reload
      </button>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultGroupBy={[{ field: 'age' }]}
        >
          <InfiniteTable<Developer>
            debugId="test"
            domProps={{
              style: {
                margin: '5px',
                height: '80vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            columns={columns}
          >
            <InfiniteTable.GroupingToolbar />
            <InfiniteTable.Header />
            <InfiniteTable.Body />
          </InfiniteTable>
        </DataSource>
      </React.StrictMode>
    </>
  );
}
