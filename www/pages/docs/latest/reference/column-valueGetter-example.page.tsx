import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

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

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers1k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  name: {
    header: 'Full Name',
    sortable: false,
    valueGetter: ({ data }) => {
      if (!data) {
        return null;
      }
      return `${data.firstName} ${data.lastName}`;
    },
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
