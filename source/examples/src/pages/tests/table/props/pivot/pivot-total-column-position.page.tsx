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

export default function PivotPerfExample() {
  const domProps = {
    style: {
      height: '80vh',
    },
  };

  const [showTotals, setShowTotals] = React.useState(false);
  const [includeCanDesign, setIncludeCanDesign] = React.useState(false);

  const pivotBy = React.useMemo(() => {
    return [
      {
        field: 'stack',
      },
      includeCanDesign
        ? {
            field: 'canDesign',
          }
        : null,
    ].filter(Boolean) as DataSourcePivotBy<Developer>[];
  }, [includeCanDesign]);

  return (
    <>
      <button
        data-name="toggle-show-totals"
        onClick={() => {
          setShowTotals((x) => !x);
        }}
      >
        toggle show totals - {`${showTotals}`}
      </button>
      <button
        data-name="toggle-can-design"
        onClick={() => {
          setIncludeCanDesign((x) => !x);
        }}
      >
        Toggle can design from pivot -{' '}
        {`Include can design: ${includeCanDesign}`}
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
              pivotGrandTotalColumnPosition="end"
            />
          );
        }}
      </DataSource>
    </>
  );
}
