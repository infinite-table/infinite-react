import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

export type Person = {
  Id: number;
  FirstName: string;
  Age: number;
};

export const data = (): Promise<Person[]> =>
  Promise.resolve([
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
    {
      Id: 4,
      FirstName: 'Mark',
      Age: 25,
    },
    {
      Id: 5,
      FirstName: 'John',
      Age: 38,
    },
    {
      Id: 6,
      FirstName: 'Peter',
      Age: 14,
    },
  ]);

const columns: Map<string, InfiniteTableColumn<Person>> = new Map([
  [
    'identifier',
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
    },
  ],
  ['age', { field: 'Age', type: 'number' }],
]);

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [cols, setCols] = React.useState<
    Map<string, InfiniteTableColumn<Person>>
  >(new Map<string, InfiniteTableColumn<Person>>());

  React.useEffect(() => {
    setTimeout(() => {
      setCols(() => columns);
    });
  }, []);

  return (
    <DataSource<Person> data={data} primaryKey="Id">
      <InfiniteTable<Person> columns={cols} domProps={domProps} />
    </DataSource>
  );
}
