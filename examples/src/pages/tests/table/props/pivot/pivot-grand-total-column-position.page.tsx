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

import { Developer, developers } from './pivot-total-column-position-data';
import { InfiniteTablePropPivotGrandTotalColumnPosition } from '@infinite-table/infinite-react/components/InfiniteTable/types/InfiniteTableState';

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
const pivotBy: DataSourcePivotBy<Developer>[] = [{ field: 'stack' }];

export default function PivotPerfExample() {
  const domProps = {
    style: {
      height: '80vh',
    },
  };

  const [position, setPosition] =
    React.useState<InfiniteTablePropPivotGrandTotalColumnPosition>(false);

  return (
    <>
      <button
        onClick={() => {
          setPosition((x) => {
            return x === 'end' ? 'start' : x === 'start' ? false : 'end';
          });
        }}
      >
        toggle grand totals - {`${position}`}
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
              pivotGrandTotalColumnPosition={position}
            />
          );
        }}
      </DataSource>
    </>
  );
}
