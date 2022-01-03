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
      <InfiniteTable<Person>
        licenseKey="<INVALID>"
        columnDefaultWidth={130}
        columns={columns}
      />
    </DataSource>
  );
}
