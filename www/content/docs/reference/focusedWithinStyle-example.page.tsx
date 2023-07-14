import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    field: 'Id',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
    render: ({ value }: { value: any }) => <input type="text" value={value} />,
  },

  age: { field: 'Age', type: 'number' },
};
