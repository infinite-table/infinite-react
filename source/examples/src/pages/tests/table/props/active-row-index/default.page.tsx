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
  preferredLanguage: { field: 'preferredLanguage' },
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
  city: { field: 'city' },
  currency: { field: 'currency' },
};

export default function LocalUncontrolledSingleSortingExample() {
  return (
    <>
      <input />
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultSortInfo={{
          field: 'salary',
          dir: 1,
        }}
      >
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={220}
          defaultActiveRowIndex={0}
          keyboardNavigation={false} //row | false
          domProps={{
            style: { height: '90vh' },
          }}
          onReady={(api) => {
            (globalThis as any).api = api;
          }}
        />
      </DataSource>
      <input />
    </>
  );
}
const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
  // .then((data) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(data);
  //     }, 1000);
  //   });
  // });
};
