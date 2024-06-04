import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    field: 'Id',
    header: '🎉 Identifier',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 140,
  },
  firstName: {
    field: 'FirstName',
    header: 'Name',
    defaultWidth: 120,
  },
  age: { field: 'Age', type: 'number', defaultWidth: 100 },
};
export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={columns} />
    </DataSource>
  );
}
