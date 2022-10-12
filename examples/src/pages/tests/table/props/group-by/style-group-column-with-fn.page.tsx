import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  companyName: string;
  countryCode: string;
  companySize: string;
  streetName: string;
  streetPrefix: string;
  streetNo: number;
  reposCount: number;
  email: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const developers: Developer[] = [
  {
    id: 0,
    companyName: 'Hilll Inc',
    companySize: '0 - 10',
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    countryCode: 'IN',
    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    reposCount: 35,
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
];

const domProps = {
  style: {
    height: '80vh',
  },
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
  age: {
    name: 'Age (avg)',
    field: 'age',
    reducer: 'avg',
  },
};
const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const dataSource = developers;

const groupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
    column: {
      style: () => ({
        color: 'red',
      }),
    },
  },
  {
    field: 'city',
    column: {
      style: {
        color: 'blue',
      },
    },
  },
];

export default function StyleGroupColumn() {
  return (
    <React.StrictMode>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columnDefaultWidth={150}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}
