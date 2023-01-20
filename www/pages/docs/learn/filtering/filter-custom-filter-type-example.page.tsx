import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnFilterEditor,
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
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
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
              emptyValues: new Set([]),
              components: {
                FilterEditor: () => {
                  const { operator, filtered } =
                    useInfiniteColumnFilterEditor();
                  return (
                    <div data-operator="default-filter-type-editor">
                      {filtered ? <>Operator {operator}</> : 'Not applied'}
                    </div>
                  );
                },
              },
              valueGetter: ({ data, field }) => {
                debugger;
                return (data[field!] as number) * 10;
              },

              operators: [
                {
                  name: 'low',
                  fn: ({ currentValue, filterValue, emptyValues }) => {
                    debugger;
                    if (
                      emptyValues.has(currentValue) ||
                      emptyValues.has(filterValue)
                    ) {
                      return true;
                    }
                    return currentValue <= 1000;
                  },
                },
                {
                  name: 'medium',
                  fn: ({ currentValue }) => {
                    return currentValue > 1000 && currentValue < 10000;
                  },
                  components: {
                    FilterEditor: () => (
                      <div data-operator="medium">Medium</div>
                    ),
                  },
                },
                {
                  name: 'high',
                  fn: ({ currentValue }) => {
                    return currentValue >= 10000;
                  },
                  components: {
                    FilterEditor: () => <div data-operator="high">High</div>,
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
