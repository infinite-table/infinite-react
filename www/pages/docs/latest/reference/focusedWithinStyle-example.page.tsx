import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { data, Person } from './data';

const focusedWithinStyle = {
  outline: '3px solid tomato',
};
export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        focusedWithinStyle={focusedWithinStyle}
        columns={columns}
      />
    </DataSource>
  );
}

const columns: Map<
  string,
  InfiniteTableColumn<Person>
> = new Map([
  [
    'id',
    {
      field: 'Id',
      type: 'number',
      sortable: true,
      width: 80,
    },
  ],
  [
    'firstName',
    {
      field: 'FirstName',
      render: ({ value }: { value: string }) => (
        <input type="text" value={value} />
      ),
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);
