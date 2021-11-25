import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

export default function App() {
  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person>
        columnDefaultWidth={130}
        columns={columns}
      />
    </DataSource>
  );
}

type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

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
