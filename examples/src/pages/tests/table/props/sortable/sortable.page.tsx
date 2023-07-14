import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';

interface Person {
  Id: number;
  FirstName: string;
  Age: number;
}

const data = [
  {
    Id: 20,
    FirstName: 'Bob',
    Age: 3,
  },
  {
    Id: 3,
    FirstName: 'Alice',
    Age: 50,
  },
  {
    Id: 10,
    FirstName: 'Bill',
    Age: 5,
  },
];
export default function SortablePage() {
  return (
    <React.StrictMode>
      <p>
        Table is configured with <b>sortable=false</b> on this page, but the{' '}
        <b>Id</b> column specifically configured as <b>sortable=true</b>
      </p>
      <DataSource<Person> data={data} primaryKey="Id">
        <InfiniteTable<Person>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={100}
          columnDefaultSortable={false}
          virtualizeColumns={false}
          columns={{
            id: {
              field: 'Id',
              type: 'number',
              defaultSortable: true,
            },
            firstName: {
              field: 'FirstName',
            },
            age: { field: 'Age', type: 'number' },
          }}
        />
      </DataSource>
    </React.StrictMode>
  );
}
