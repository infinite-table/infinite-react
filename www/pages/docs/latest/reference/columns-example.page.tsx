import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import { data, Person } from './data';
const columns: InfiniteTablePropColumns<Person> = {
  identifier: {
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

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={columns} />
    </DataSource>
  );
}
