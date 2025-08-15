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
    header: 'Language',
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultGroupable: false,
  },
  age: {
    field: 'age',
  },
  canDesign: {
    field: 'canDesign',
    defaultGroupable: true,
    header: ({ renderLocation }) => {
      return (
        <div>
          hey{' '}
          {renderLocation === 'grouping-toolbar'
            ? 'CAN DESIGN'
            : 'can design!!'}
        </div>
      );
    },
  },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id', defaultGroupable: false },
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
          field: 'preferredLanguage',
        },
      ]}
    >
      <InfiniteTable<Developer>
        domProps={{
          style: {
            marginBlock: '80px',
            marginInline: '80px',
            height: '80vh',
            border: '1px solid gray',
            position: 'relative',
          },
        }}
        columns={columns}
        columnDefaultWidth={200}
        columnDefaultGroupable
        groupRenderStrategy="single-column"
      >
        <InfiniteTable.GroupingToolbar />
        <InfiniteTable.Header />
        <InfiniteTable.Body />
      </InfiniteTable>
    </DataSource>
  );
}
