import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    salary: 2000,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    salary: 3500,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    salary: 3000,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    salary: 1000,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    salary: 12900,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  // id: {
  //   field: 'id',
  // },
  // firstName: {
  //   field: 'firstName',
  // },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },
  // stack: { field: 'stack' },
  // currency: { field: 'currency', defaultFilterable: false },
};

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
          filterDelay={0}
          filterTypes={{
            salary: {
              defaultOperator: '',
              emptyValues: new Set(['', null, undefined]),
              operators: [
                {
                  name: 'gt',
                  label: 'Greater Than',
                  components: {
                    Icon: () => <>{'>'}</>,
                  },
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue > filterValue;
                  },
                },
                {
                  name: 'gte',
                  components: {
                    Icon: () => <>{'>='}</>,
                  },
                  label: 'Greater Than or Equal',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue >= filterValue;
                  },
                },
                {
                  name: 'lt',
                  components: {
                    Icon: () => <>{'<'}</>,
                  },
                  label: 'Less Than',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue < filterValue;
                  },
                },
                {
                  name: 'lte',
                  components: {
                    Icon: () => <>{'<='}</>,
                  },
                  label: 'Less Than or Equal',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue <= filterValue;
                  },
                },
              ],
            },
          }}
        >
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
