import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  country: string;

  currency: string;
  canDesign: boolean;
  hobby: string;
  age: number;
};

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  country: { field: 'country' },

  canDesign: {
    field: 'canDesign',
  },
  currency: {
    field: 'currency',
  },
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    country: 'USA',
    currency: 'USD',
    canDesign: true,
    hobby: 'Skiing',
    age: 30,
  },
  {
    id: 2,
    firstName: 'Jane',
    country: 'USA',
    currency: 'USD',
    canDesign: false,
    hobby: 'Skiing',
    age: 30,
  },
  {
    id: 3,
    firstName: 'John',
    country: 'UK',
    currency: 'GBP',
    canDesign: true,
    hobby: 'Fishing',
    age: 40,
  },
  {
    id: 4,
    firstName: 'Janette',
    country: 'UK',
    currency: 'GBP',
    canDesign: false,
    hobby: 'Fishing',
    age: 45,
  },
];

const domProps = {
  style: { height: '80vh' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'canDesign',
  },
];

export default function GroupByExample() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={data} groupBy={groupBy}>
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={200}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}
