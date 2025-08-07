import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
  DataSourceData,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'This is my preferred language',
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultGroupable: false,
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign', defaultGroupable: true },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
};

const dataSource: DataSourceData<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10k-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultGroupBy={[
        { field: 'country' },
        {
          field: 'stack',
        },
      ]}
    >
      <InfiniteTable<Developer>
        domProps={{
          style: {
            margin: '5px',
            height: '80vh',
            border: '1px solid gray',
            position: 'relative',
          },
        }}
        defaultColumnPinning={{
          salary: 'start',
        }}
        columns={columns}
        columnDefaultWidth={200}
        columnDefaultGroupable
      >
        <InfiniteTable.GroupingToolbar />
        <InfiniteTable.Header />
        <InfiniteTable.Body />

        <InfiniteTable.Header />
      </InfiniteTable>
    </DataSource>
  );
}
