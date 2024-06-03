import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  identifier: {
    field: 'Id',
    type: 'number',
    defaultSortable: true,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={columns} columnDefaultWidth={120} />
    </DataSource>
  );
}
