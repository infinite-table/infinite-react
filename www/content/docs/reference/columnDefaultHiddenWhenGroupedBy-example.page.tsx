import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumnSizing,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: {
    field: 'preferredLanguage',
    // hide whenever grouped by preferredLanguage
    defaultHiddenWhenGroupedBy: 'preferredLanguage',
  },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },

  city: {
    field: 'city',
    // hide whenever grouped by country or city
    defaultHiddenWhenGroupedBy: {
      country: true,
      city: true,
    },
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
    // hide whenever there is grouping
    defaultHiddenWhenGroupedBy: '*',
  },
  currency: { field: 'currency' },
};

const columnSizing: InfiniteTablePropColumnSizing = {
  country: { width: 100 },
  city: { flex: 1, minWidth: 100 },
  salary: { flex: 2, maxWidth: 500 },
};

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      defaultGroupBy={[
        { field: 'stack' },
        { field: 'preferredLanguage' },
        { field: 'country' },
      ]}
      primaryKey="id"
    >
      <InfiniteTable<Developer>
        columns={columns}
        columnDefaultWidth={250}
        columnSizing={columnSizing}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
