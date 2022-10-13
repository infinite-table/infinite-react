import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const focusedStyle = {
  outline: '3px solid tomato',
};
export default function App() {
  return (
    <>
      <button autoFocus>Button before - to help with focus navigation</button>
      <DataSource<Person> data={data} primaryKey="Id">
        <InfiniteTable<Person> focusedStyle={focusedStyle} columns={columns} />
      </DataSource>
      <button>Button after - to help with focus navigation</button>
    </>
  );
}

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    field: 'Id',
    type: 'number',
    sortable: true,
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};
