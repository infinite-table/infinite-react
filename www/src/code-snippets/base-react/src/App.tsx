import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import '@infinite-table/infinite-react/index.css';

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

const data: Person[] = [
  {
    Id: 1,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 2,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 3,
    FirstName: 'Bill',
    Age: 5,
  },
];

const columns: Record<string, InfiniteTableColumn<Person>> = {
  id: {
    // specifies which field from the data source
    // should be rendered in this column
    field: 'Id',
    type: 'number',
    defaultSortable: true,
    defaultWidth: 100,
  },
  firstName: {
    field: 'FirstName',
  },
  age: { field: 'Age', type: 'number' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        domProps={domProps}
        columnDefaultWidth={200}
        columns={columns}
      />
    </DataSource>
  );
}
