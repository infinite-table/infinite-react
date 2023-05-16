import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
  InfiniteTablePropColumnTypes,
  DataSourceData,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Bobson',
      country: 'USA',
      city: 'LA',
      currency: 'USD',
    },
    {
      id: 2,
      firstName: 'Bill',
      lastName: 'Richardson',
      country: 'USA',
      city: 'NY',
      currency: 'USD',
    },
    {
      id: 3,
      firstName: 'Nat',
      lastName: 'Natson',
      country: 'Canada',
      city: 'Montreal',
      currency: 'CAD',
    },
  ];
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  country: {
    field: 'country',
    align: ({ isHeader, rowInfo }) => {
      if (isHeader) {
        return 'start';
      }

      return rowInfo.data?.country === 'USA' ? 'start' : 'end';
    },
  },
  firstName: {
    field: 'firstName',
    align: 'end',
  },
  preferredLanguage: {
    field: 'currency',
  },
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={500}
          domProps={{
            style: {
              height: 500,
            },
          }}
        />
      </DataSource>
    </>
  );
}
