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
    'identifier',
    {
      field: 'Id',
      type: 'number',
      sortable: true,
    },
  ],
  [
    'firstName',
    {
      field: 'FirstName',
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        columns={columns}
        columnDefaultWidth={120}
      />
    </DataSource>
  );
}
