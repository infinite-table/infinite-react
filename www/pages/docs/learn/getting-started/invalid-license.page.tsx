import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { InfiniteTableColumn } from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
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
      <InfiniteTable<Person>
        licenseKey="<INVALID>"
        columnDefaultWidth={130}
        columns={columns}
      />
    </DataSource>
  );
}
