import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    cssEllipsis: false,
    defaultWidth: 60,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    defaultWidth: 100,
    headerCssEllipsis: false,
    cssEllipsis: true,
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

export default function CssEllipsis() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={200} />
      </DataSource>
    </>
  );
}
