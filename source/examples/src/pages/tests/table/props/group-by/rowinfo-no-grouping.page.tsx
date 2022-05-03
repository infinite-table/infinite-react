import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
};

const dataSource = () => {
  return Promise.resolve([
    {
      id: 1,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Giuseppe',
    },
    {
      id: 2,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Marco',
    },
    {
      id: 3,
      country: 'Italy',
      city: 'Napoli',
      firstName: 'Luca',
    },
    {
      id: 4,
      country: 'USA',
      city: 'LA',
      firstName: 'Bob',
    },
  ] as Person[]);
};

const columns = new Map<string, InfiniteTableColumn<Person>>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
]);
export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person> data={dataSource} primaryKey="id">
        {({ dataArray }) => {
          (globalThis as any).dataArray = dataArray;
          return (
            <InfiniteTable<Person>
              domProps={{
                style: {
                  margin: '5px',
                  height: 900,
                  border: '1px solid gray',
                  position: 'relative',
                },
              }}
              columnDefaultWidth={300}
              columns={columns}
            />
          );
        }}
      </DataSource>
    </React.StrictMode>
  );
}
