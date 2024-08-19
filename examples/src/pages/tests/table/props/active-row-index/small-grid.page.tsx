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

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    currency: '$',
    email: 'John@doe.com',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    canDesign: 'yes',
    hobby: 'Coding',
    salary: 50000,
    age: 30,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    country: 'USA',
    city: 'San Francisco',
    currency: '$',
    email: 'Jane@doe.com',
    preferredLanguage: 'Ruby',
    stack: 'backend',
    canDesign: 'no',
    hobby: 'Photography',
    salary: 60000,
    age: 35,
  },
  {
    id: 3,
    firstName: 'Bob',
    lastName: 'Doe',
    country: 'Canada',
    city: 'Toronto',
    currency: '$',
    email: 'Bob@doe.com',
    preferredLanguage: 'Ruby',
    stack: 'frontend',
    canDesign: 'no',
    hobby: 'Photography',
    salary: 40000,
    age: 28,
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  id: { field: 'id' },
};

export default function KeyboardNavigationForRows() {
  return (
    <DataSource<Developer> primaryKey="id" data={dataSource}>
      <InfiniteTable<Developer>
        columns={columns}
        keyboardNavigation="row"
        defaultActiveRowIndex={2}
        rowHeight={40}
        columnDefaultWidth={120}
        header={false}
        domProps={{
          style: {
            width: 800,
            minHeight: 120,
          },
        }}
      />
    </DataSource>
  );
}
