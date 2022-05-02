import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTablePropColumns,
  DataSourcePropGroupRowsStateObject,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Person = {
  id: number;
  country: string;
  city: string;
  firstName: string;
  age: number;
};

const dataSource = () => {
  return Promise.resolve([
    {
      id: 1,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Giuseppe',
      age: 20,
    },
    {
      id: 2,
      country: 'Italy',
      city: 'Rome',
      firstName: 'Marco',
      age: 30,
    },
    {
      id: 3,
      country: 'Italy',
      city: 'Napoli',
      age: 40,
      firstName: 'Luca',
    },
    {
      id: 4,
      country: 'USA',
      city: 'LA',
      age: 50,
      firstName: 'Bob',
    },
  ] as Person[]);
};

const columns: InfiniteTablePropColumns<Person> = {
  firstName: {
    field: 'firstName',
  },
};

const groupBy: DataSourceGroupBy<Person>[] = [
  {
    field: 'country',
  },
  { field: 'city' },
  { field: 'age' },
];

const groupRowsState: DataSourcePropGroupRowsStateObject<string> = {
  collapsedRows: [
    ['Italy', 'Rome'],
    ['Italy', 'Napoli'],
  ],
  expandedRows: true,
};

export default function GroupByExample() {
  return (
    <React.StrictMode>
      <DataSource<Person>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
        groupRowsState={groupRowsState}
      >
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
              groupRenderStrategy="single-column"
              columnDefaultWidth={300}
              columns={columns}
            />
          );
        }}
      </DataSource>
    </React.StrictMode>
  );
}
