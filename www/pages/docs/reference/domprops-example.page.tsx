import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { data, Person } from './data';

const domProps = {
  style: {
    outline: '3px solid tomato',
    height: '100%',
  },
  onClick: () => {
    // open browser devtools to see message
    console.log('TABLE CLICKED');
  },
};

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> domProps={domProps} columns={columns} />
    </DataSource>
  );
}

const columns: Map<string, InfiniteTableColumn<Person>> = new Map([
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
