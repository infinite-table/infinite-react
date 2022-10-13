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
  id: { field: 'id', defaultWidth: 80 },
  name: {
    header: 'Full Name',
    valueFormatter: ({ data, isGroupRow, value }) => {
      if (isGroupRow) {
        return <b>{value}</b>;
      }
      return (
        <b>
          <pre>
            {data.firstName}, {data.lastName}
          </pre>
        </b>
      );
    },
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

export default function ColumnValueFormatterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer> columns={columns} columnDefaultWidth={200} />
      </DataSource>
    </>
  );
}
