import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      selectionMode="multi-row"
      primaryKey="id"
    >
      <InfiniteTable<Developer> columns={columns} columnDefaultWidth={150} />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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
