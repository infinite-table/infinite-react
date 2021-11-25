import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { data, Person } from './data';

const columns: Map<
  string,
  InfiniteTableColumn<Person>
> = new Map([
  [
    'id',
    {
      field: 'Id',
      header: '🎉 Identifier',
      type: 'number',
      sortable: true,
      width: 140,
    },
  ],
  [
    'firstName',
    {
      field: 'FirstName',
      header: 'Name',
      width: 120,
    },
  ],
  ['age', { field: 'Age', type: 'number', width: 100 }],
]);

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={columns} />
    </DataSource>
  );
}
