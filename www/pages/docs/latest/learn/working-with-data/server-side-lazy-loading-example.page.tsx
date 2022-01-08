import * as React from 'react';

import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

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

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers10'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  salary: { field: 'salary' },
  age: {
    field: 'age',
    renderValue: ({ value, rowInfo: { isGroupRow } }) =>
      isGroupRow ? `Avg: ${value}` : value,
  },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
};

const groupBy: DataSourceGroupBy<Developer>[] = [
  { field: 'preferredLanguage' },
];

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const avgReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: 0,
  field: 'salary',
  reducer: (acc, sum) => {
    return acc + sum;
  },
  done: (sum, arr) => {
    return arr.length ? sum / arr.length : 0;
  },
};

const columnAggregations: InfiniteTablePropColumnAggregations<Developer> =
  {
    salary: avgReducer,
    age: {
      ...avgReducer,
      field: 'age',
    },
  };
export default function App() {
  return (
    <>
      <DataSource<Developer>
        data={dataSource}
        defaultGroupRowsState={groupRowsState}
        groupBy={groupBy}
        primaryKey="id">
        <InfiniteTable<Developer>
          columns={columns}
          columnAggregations={columnAggregations}
        />
      </DataSource>
      {/* 
      <DataSource<Developer>
        data={dataSource}
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}
        primaryKey="id">
        <InfiniteTable<Developer>
          columns={columns}
          columnAggregations={columnAggregations}
        />
      </DataSource> */}
    </>
  );
}
