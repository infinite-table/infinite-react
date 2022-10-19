import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

type GroupByDeveloperType = DataSourceGroupBy<Developer>[];
type PivotByDeveloperType = DataSourcePivotBy<Developer>[];

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  currency: { field: 'currency' },
};

// Groupings
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const domProps = {
  style: {
    height: '70vh',
  },
};

const reducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary',
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age',
  },
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] = React.useState<GroupByDeveloperType>([]);
  const [pivotBy, setPivotBy] = React.useState<PivotByDeveloperType>([]);

  const [isGrouped, setIsGrouped] = React.useState(false);
  const [isPivoted, setIsPivoted] = React.useState(false);

  const [_, setRefresh] = React.useState(0);

  (globalThis as any).setGroupBy = setGroupBy;
  (globalThis as any).setPivotBy = setPivotBy;

  return (
    <>
      <button
        onClick={() => {
          setRefresh((refresh) => refresh + 1);
        }}
        style={{ color: 'magenta' }}
      >
        refresh
      </button>

      <label style={{ color: 'magenta' }}>
        Pivoted
        <input
          type="checkbox"
          name="pivoted"
          checked={isPivoted}
          onChange={(event) => {
            setIsPivoted(event.target.checked);
          }}
        ></input>
      </label>
      <label style={{ color: 'magenta' }}>
        Grouped
        <input
          type="checkbox"
          name="grouped"
          checked={isGrouped}
          onChange={(event) => {
            setIsGrouped(event.target.checked);
          }}
        ></input>
      </label>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={isGrouped ? groupBy : undefined}
        pivotBy={isPivoted ? pivotBy : undefined}
        aggregationReducers={reducers}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              virtualizeColumns={false}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="end"
            />
          );
        }}
      </DataSource>
    </>
  );
}
