import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { CSSProperties } from 'react';

import { data, Person } from './data';

export default function App() {
  return (
    <div
      style={
        {
          position: 'relative',
          flex: 1,
          display: 'flex',
          '--row-height': '70px',
        } as CSSProperties
      }
    >
      <DataSource<Person> data={data} primaryKey="Id">
        <InfiniteTable<Person> rowHeight={'--row-height'} columns={columns} />
      </DataSource>
    </div>
  );
}

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
    field: 'Id',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 80,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};
