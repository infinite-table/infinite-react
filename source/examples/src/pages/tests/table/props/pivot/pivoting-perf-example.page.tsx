import * as React from 'react';

import Select, { Props as SelectProps } from 'react-select';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
  debounce,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTableProps,
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers50k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

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
    style: {
      color: 'blue',
    },
  },
  age: {
    field: 'age',
    type: ['number'],
    // style: {
    //   color: 'blue',
    // },
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

const numberFormatter = new Intl.NumberFormat();

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    renderValue: ({ value }) =>
      typeof value === 'number'
        ? numberFormatter.format(value as number)
        : null,
  },
  currency: {
    renderValue: (param) => {
      const { value, data } = param;
      return typeof value === 'number'
        ? `${numberFormatter.format(value as number)} ${data?.currency ?? ''}`
        : null;
    },
  },
  default: {
    style: {},
  },
};

// //  Column modifiers
// const getPivotColumn = (
//   column: InfiniteTableColumn<Developer>
// ): Partial<InfiniteTablePivotColumn<Developer>> => {
//   return {
//     ...column,
//     style: (params) => {
//       if (typeof params.value === 'number') {
//         return {
//           fontStyle: 'italic',
//         };
//       }
//     },
//   };
// };

// const _getGroupColumn = (
//   column: InfiniteTableColumn<Developer>
// ): Partial<InfiniteTableColumn<Developer>> => {
//   return {
//     style: {
//       color: 'red',
//     },
//   };
// };

// const groupColumn = {
//   style: {
//     fontWeight: '600',
//     color: 'var(--infinite-accent-color)',
//   },
// };

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
const groupBy: DataSourceGroupBy<Developer>[] = [
  // {
  //   field: 'ci',
  // },
  { field: 'city' },
  { field: 'age' },
  { field: 'stack' },
];
const pivotBy: DataSourcePivotBy<Developer>[] = [
  {
    field: 'preferredLanguage',
  },
  {
    field: 'stack',
  },
  {
    field: 'age',
  },
];

export default function PivotPerfExample() {
  const domProps = {
    style: {
      height: '80vh',
    },
  };

  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        pivotBy={pivotBy}
        aggregationReducers={reducers}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              hideEmptyGroupColumns
              columnTypes={columnTypes}
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
