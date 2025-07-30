import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  DataSourcePropGroupRowsStateObject,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'country',
    column: {
      header: 'Country group',
      renderGroupValue: ({ value }) => <>Country: {value}</>,
    },
  },
  {
    field: 'stack',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
    // specifying a style here for the column
    // note: it will also be "picked up" by the group column
    // if you're grouping by the 'country' field
    style: {
      color: 'tomato',
    },
  },
  firstName: { field: 'firstName' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },

  canDesign: { field: 'canDesign' },
  stack: { field: 'stack' },
};

const defaultGroupRowsState: DataSourcePropGroupRowsStateObject = {
  collapsedRows: true,
  expandedRows: [['Mexico'], ['Mexico', 'backend'], ['India']],
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      groupBy={groupBy}
      defaultGroupRowsState={defaultGroupRowsState}
    >
      <InfiniteTable<Developer> columns={columns} />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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
