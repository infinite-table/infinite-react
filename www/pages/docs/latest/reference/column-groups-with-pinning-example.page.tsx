import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumnGroup,
  InfiniteTablePropColumnPinning,
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
  currency: {
    field: 'currency',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
    maxWidth: 400,
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
  id: { field: 'id', defaultWidth: 80 },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
};

const columnGrous: Record<
  string,
  InfiniteTableColumnGroup
> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};

const defaultColumnPinning: InfiniteTablePropColumnPinning =
  {
    country: 'start',
  };
export default function ColumnGroupsWithPinningExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}>
        <InfiniteTable<Developer>
          columnGroups={columnGrous}
          columns={columns}
          columnDefaultWidth={100}
          defaultColumnPinning={defaultColumnPinning}
        />
      </DataSource>
    </>
  );
}
