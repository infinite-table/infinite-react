import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

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
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    renderSelectionCheckBox: true,
    style: {
      color: 'red',
      textDecoration: 'underline',
    },
    renderLeafValue: ({ value }) => {
      return `${value}!`;
    },
  },
  lastName: {
    field: 'lastName',
  },
  stack: {
    field: 'stack',
    renderValue: ({ value }) => {
      return `${value || ''}.`;
    },
  },
  preferredLanguage: {
    field: 'preferredLanguage',

    renderValue: ({ value }) => {
      return `${value || ''}?`;
    },
    style: {
      color: 'green',
      fontSize: 24,
    },
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
  },
};
const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        groupBy={[{ field: 'stack' }, { field: 'preferredLanguage' }]}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          groupColumn={{
            field: 'firstName',
            style: {
              textDecoration: 'line-through',
              fontWeight: 'bold',
              fontSize: 16,
            },
          }}
          groupRenderStrategy={'single-column'}
          columns={columns}
          columnDefaultWidth={200}
        />
      </DataSource>
    </>
  );
}
