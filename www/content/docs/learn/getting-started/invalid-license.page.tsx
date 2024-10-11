import '@infinite-table/infinite-react/index.css';
import {
  InfiniteTable,
  DataSource,
  type InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import * as React from 'react';

import { data, Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
    field: 'Id',
    type: 'number',
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        licenseKey="<INVALID>"
        columnDefaultWidth={130}
        columns={columns}
      />
    </DataSource>
  );
}
