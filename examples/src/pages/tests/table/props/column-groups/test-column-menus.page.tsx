import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnGroups,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    id: 1,
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    id: 2,
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    id: 3,
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
];

const columns: InfiniteTablePropColumns<Person> = {
  firstName: {
    field: 'firstName',
    header: 'First Name',
    columnGroup: 'hello',
  },
  lastName: {
    field: 'lastName',

    columnGroup: 'hello',
    header: ({ renderLocation }) => {
      if (renderLocation === 'column-menu') {
        return 'Last name in col';
      }
      return 'Last Name!!';
    },
  },
  age: {
    field: 'age',
    header: 'Age',
    columnGroup: 'info',
  },
  visits: {
    field: 'visits',
    columnGroup: 'moreInfo',
  },
  status: {
    field: 'status',
    header: 'Status',
    columnGroup: 'moreInfo',
  },
  progress: {
    field: 'progress',
    header: 'Profile Progress',
    columnGroup: 'moreInfo',
  },
};

const columnGroups: InfiniteTablePropColumnGroups = {
  moreInfo: {
    header: 'More Info',
    columnGroup: 'info',
  },
  info: {
    header: 'Info',
  },
  hello: {
    header: 'Hello',
  },
};

export default function App() {
  return (
    <>
      <DataSource<Person> data={defaultData} primaryKey="id">
        <InfiniteTable<Person>
          columnDefaultWidth={130}
          columns={columns}
          domProps={{
            style: {
              height: 400,
            },
          }}
          columnGroups={columnGroups}
        />
      </DataSource>
    </>
  );
}
