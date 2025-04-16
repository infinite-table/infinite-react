import {
  InfiniteTable,
  DataSource,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
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
    currency: 'USD',
    email: 'john.doe@example.com',
    preferredLanguage: 'English',
    stack: 'Frontend',
    canDesign: 'yes',
    hobby: 'Reading',
    salary: 100000,
    age: 30,
  },
];
const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};
const domProps = {
  style: {
    height: '100%',
  },
};
const containerStyle = {
  flex: 1,
  height: '100%',
  padding: 10,
};
const infiniteProps: InfiniteTableProps<Developer> = {
  wrapRowsHorizontally: true,
  columns,
  domProps,
  // rowHeight: 40,
  columnHeaderHeight: 53,
  // keyboardNavigation: 'row',

  columnMinWidth: 100,
};
export default function Example() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexFlow: 'row',
      }}
    >
      <div style={containerStyle} className="infinite-theme-mode--dark">
        <DataSource<Developer>
          primaryKey="id"
          data={dataSource}
          selectionMode="multi-row"
          defaultRowSelection={{
            defaultSelection: false,
            selectedRows: [],
          }}
        >
          <InfiniteTable<Developer> {...infiniteProps} />
        </DataSource>
      </div>
      <div
        style={{ ...containerStyle, background: 'white' }}
        className="infinite-theme-mode--light"
      >
        <DataSource<Developer>
          primaryKey="id"
          data={dataSource}
          selectionMode="multi-row"
          defaultRowSelection={{
            defaultSelection: false,
            selectedRows: [],
          }}
        >
          <InfiniteTable<Developer> {...infiniteProps} />
        </DataSource>
      </div>
    </div>
  );
}
