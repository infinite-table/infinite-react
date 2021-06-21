import * as React from 'react';

import { InfiniteTableFactory } from '@components/InfiniteTable';
import { DataSource } from '@src/components/DataSource';

interface Person {
  Id: number;
  FirstName: string;
  Age: number;
}

const Table = InfiniteTableFactory<Person>();

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
const SortablePage = () => {
  return (
    <React.StrictMode>
      <p>
        Table is configured with <b>sortable=false</b> on this page, but the{' '}
        <b>Id</b> column specifically configured as <b>sortable=true</b>
      </p>
      <DataSource<Person>
        data={data}
        primaryKey="Id"
        fields={['Id', 'FirstName', 'Age']}
      >
        <Table
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnDefaultWidth={100}
          sortable={false}
          virtualizeColumns={false}
          columns={
            new Map([
              [
                'id',
                {
                  field: 'Id',
                  type: 'number',
                  sortable: true,
                },
              ],
              [
                'firstName',
                {
                  field: 'FirstName',
                },
              ],
              ['age', { field: 'Age', type: 'number' }],
            ])
          }
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default SortablePage;
