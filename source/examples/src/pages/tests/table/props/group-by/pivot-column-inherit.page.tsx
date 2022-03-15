import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
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
  companyName: string;

  countryCode: string;
  companySize: string;
  streetName: string;
  streetPrefix: string;
  streetNo: number;
  reposCount: number;
  email: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};
const developers: Developer[] = [
  {
    id: 0,
    companyName: 'Hilll Inc',
    companySize: '0 - 10',
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    countryCode: 'IN',
    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    reposCount: 35,
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
    email: 'Nya44@gmail.com',
  },
];

const dataSource = developers;

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => {
    return Math.floor(arr.length ? sum / arr.length : 0);
  },
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: { field: 'salary', ...avgReducer },
  age: {
    field: 'age',
    ...avgReducer,
    pivotColumn: {
      defaultWidth: 500,
      inheritFromColumn: 'preferredLanguage',
    },
  },
};

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  [
    'preferredLanguage',
    {
      field: 'preferredLanguage',
      style: {
        color: 'blue',
      },
    },
  ],
  [
    'age',
    {
      field: 'age',
      style: {
        color: 'magenta',
        background: 'yellow',
      },
    },
  ],
  [
    'salary',
    {
      field: 'salary',
      type: 'number',
      style: {
        color: 'red',
      },
    },
  ],
  ['canDesign', { field: 'canDesign' }],
  ['country', { field: 'country' }],
  ['firstName', { field: 'firstName' }],
  ['stack', { field: 'stack' }],
  ['id', { field: 'id' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['currency', { field: 'currency' }],
]);

const domProps = { style: { height: '100vh' } };

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

export default function GroupByExample() {
  const groupBy = React.useMemo<DataSourceGroupBy<Developer>[]>(
    () => [
      {
        field: 'country',
      },
      {
        field: 'stack',
        column: {
          header: 'test',
          render: ({ value }) => value,
        },
      },
    ],
    [],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'currency',
        // pivotColumn,
      },

      {
        field: 'canDesign',
        column: (param) => {
          const { column } = param;

          return {
            ...column,
          };
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={aggregationReducers}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              groupRenderStrategy="single-column"
              hideEmptyGroupColumns
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={220}
            />
          );
        }}
      </DataSource>
      {/* <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
      >
        <InfiniteTable<Developer>
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={180}
          columnAggregations={columnAggregations}
        />
      </DataSource> */}
    </>
  );
}
