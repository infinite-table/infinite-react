import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropAggregationReducers,
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

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',

    city: 'Unnao',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Rob',
    lastName: 'Boston',
    country: 'USA',

    city: 'LA',
    streetName: 'Purdy Lane',
    streetPrefix: 'Landing',
    streetNo: 183,
    age: 24,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
    canDesign: 'no',
    salary: 10000,
    hobby: 'sports',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: {
    field: 'city',
  },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
  },
  currency: { field: 'currency' },
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
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
const groupBy: DataSourceGroupBy<Developer>[] = [{ field: 'country' }];
const pivotBy: DataSourcePivotBy<Developer>[] = [
  // {
  //   field: 'stack',
  // },
];

export default function PivotPerfExample() {
  const domProps = {
    style: {
      height: '80vh',
    },
  };

  const [showTotals, setShowTotals] = React.useState(true);

  return (
    <>
      <button
        onClick={() => {
          setShowTotals((x) => !x);
        }}
      >
        toggle show totals
      </button>
      <DataSource<Developer>
        primaryKey="id"
        data={developers}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={reducers}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              hideEmptyGroupColumns
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition={showTotals ? 'end' : false}
            />
          );
        }}
      </DataSource>
    </>
  );
}
