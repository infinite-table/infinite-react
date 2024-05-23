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
  salary: string;

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    salary: '$ 1000',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
    salary: '$ 11000',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    salary: '$ 12000',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
    salary: '£ 21000',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
    salary: '£ 9000',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const combinations: number[] = [];
(globalThis as any).combinations = combinations;

function handler(index: number) {
  return () => {
    combinations[index] = combinations[index] || 0;
    combinations[index]++;
  };
}

export default () => {
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={{
              style: {
                height: '100%',
              },
            }}
            keyboardShortcuts={[
              {
                key: 'cmd+shift+x',
                handler: handler(0),
              },

              {
                key: 'alt+shift+arrowleft',
                handler: handler(1),
              },
              {
                key: 'Shift+PageDown',
                handler: handler(2),
              },
              {
                key: 'alt+shift+*',
                handler: handler(3),
              },
            ]}
            keyboardNavigation="cell"
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
