import * as React from 'react';

import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

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

const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    currency: 'USD',
    preferredLanguage: 'English',
    stack: 'Frontend',
    canDesign: 'yes',
    hobby: 'Reading',
    salary: 100000,
    age: 30,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    country: 'USA',
    city: 'New York',
    currency: 'USD',
    preferredLanguage: 'English',
    stack: 'Frontend',
    canDesign: 'yes',
    hobby: 'Reading',
    salary: 100000,
    age: 30,
  },
  {
    id: 3,
    firstName: 'Alice',
    lastName: 'Smith',
    country: 'UK',
    city: 'London',
    currency: 'GBP',
    preferredLanguage: 'English',
    stack: 'Backend',
    canDesign: 'no',
    hobby: 'Painting',
    salary: 90000,
    age: 28,
  },
  {
    id: 4,
    firstName: 'Bob',
    lastName: 'Johnson',
    country: 'Canada',
    city: 'Toronto',
    currency: 'CAD',
    preferredLanguage: 'French',
    stack: 'Full Stack',
    canDesign: 'yes',
    hobby: 'Photography',
    salary: 95000,
    age: 35,
  },
  {
    id: 5,
    firstName: 'Eva',
    lastName: 'Garcia',
    country: 'Spain',
    city: 'Barcelona',
    currency: 'EUR',
    preferredLanguage: 'Spanish',
    stack: 'Frontend',
    canDesign: 'yes',
    hobby: 'Traveling',
    salary: 85000,
    age: 32,
  },
];

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  identifier: {
    field: 'id',
    renderSelectionCheckBox: true,
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },

  fullName: {
    name: 'Full name',
    render: ({ data }) => {
      return (
        <>
          {data?.firstName} - {data?.lastName}
        </>
      );
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};

const domProps = {
  style: { height: '80vh' },
};

export default function Example() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        defaultGroupRowsState={{
          expandedRows: [],
          collapsedRows: true,
        }}
        rowDisabledState={{
          disabledRows: [2, 4],
          enabledRows: true,
        }}
        rowSelection={{
          selectedRows: [3],
          defaultSelection: false,
        }}
        selectionMode="multi-row"
      >
        <InfiniteTable<Developer>
          keyboardNavigation="row"
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={200}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}
