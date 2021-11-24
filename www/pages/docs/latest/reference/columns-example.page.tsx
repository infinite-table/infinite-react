import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { data, Person } from './data';

// the columns are defined as a map
// the key being the column id - used everywhere
//            else (columnPinning, columnOrder, etc) - so, it's important
// while the values are objects with either a `field` property or some custom render functions

const columns: Map<
  string,
  InfiniteTableColumn<Person>
> = new Map([
  [
    // for the sake of clarity, in this example this is different from the `field` property
    'id',
    {
      // specifies which field from the data source
      // should be rendered in this column
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
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={columns} />
    </DataSource>
  );
}
