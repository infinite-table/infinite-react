import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

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

const columns1: InfiniteTablePropColumns<Person> = {
  identifier: {
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

const columns2: InfiniteTablePropColumns<Person> = {
  identifier: {
    field: 'Id',
    header: 'Id2',
    type: 'number',
    sortable: true,
    defaultWidth: 120,
    render: ({ value }) => <>{value}-2</>,
  },
  firstName: {
    header: 'FirstName2',
    field: 'FirstName',
    render: ({ value }) => <>{value}-2</>,
  },
  age: {
    field: 'Age',
    type: 'number',
    render: ({ value }) => <>{value}-2</>,
    header: 'Age2',
  },

  testAge: {
    field: 'Age',
    header: 'Test Age',
  },
};

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [cols, setCols] = React.useState(columns1);

  return (
    <>
      <button
        onClick={() => {
          setCols((current) => {
            return current === columns1 ? columns2 : columns1;
          });
        }}
      >
        toggle columns
      </button>
      <DataSource<Person> data={data} primaryKey="Id">
        <InfiniteTable<Person> columns={cols} domProps={domProps} />
      </DataSource>
    </>
  );
}
