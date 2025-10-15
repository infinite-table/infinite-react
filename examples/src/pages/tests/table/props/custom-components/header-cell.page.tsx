import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTablePropColumns,
  useInfiniteColumnCell,
  useInfiniteHeaderCell,
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

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef } = useInfiniteHeaderCell<Developer>();
  return (
    <div
      ref={domRef}
      {...props}
      data-name="header-cell-firstName"
      style={{
        ...props.style,
        backgroundColor: 'red',
      }}
    >
      {props.children}!
    </div>
  );
};

const ColumnCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef } = useInfiniteColumnCell<Developer>();
  return (
    <div ref={domRef} {...props} data-name="column-cell-firstName">
      {props.children}!
    </div>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: {
    field: 'firstName',
    components: {
      HeaderCell,
      ColumnCell,
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

export default () => {
  const dataSource = React.useCallback(() => {
    return Promise.resolve(data.slice(0, 1));
  }, []);
  return (
    <>
      <React.StrictMode>
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            columns={{
              firstName: columns.firstName,
            }}
            domProps={{
              style: {
                minHeight: 500,
              },
            }}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};
