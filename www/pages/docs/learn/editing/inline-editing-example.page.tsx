import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80, defaultEditable: false },
  stack: {
    field: 'stack',
    contentFocusable: true,
    header: 'Stack',
  },
  firstName: {
    field: 'firstName',
    header: 'Name',
  },
  age: {
    field: 'age',
    header: 'Age',
  },
  hobby: {
    field: 'hobby',
    header: 'Hobby',
  },
  preferredLanguage: {
    header: 'Language',
    field: 'preferredLanguage',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultEditable />
      </DataSource>
    </>
  );
}
