import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourceAggregationReducer,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
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
  return fetch(process.env.NEXT_PUBLIC_DATAURL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        }),
    );
};

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,
  field: 'salary',
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const columnAggregations: DataSourcePropAggregationReducers<Developer> = {
  salary: avgReducer,
};

const columns: InfiniteTablePropColumns<Developer> = new Map<
  string,
  InfiniteTableColumn<Developer>
>([
  ['id', { field: 'id' }],
  ['firstName', { field: 'firstName' }],
  ['preferredLanguage', { field: 'preferredLanguage' }],
  ['stack', { field: 'stack' }],
  ['country', { field: 'country' }],
  ['canDesign', { field: 'canDesign' }],
  ['hobby', { field: 'hobby' }],
  ['city', { field: 'city' }],
  ['age', { field: 'age' }],
  ['salary', { field: 'salary', type: 'number' }],
  ['currency', { field: 'currency' }],
]);

const groupRowsState = new GroupRowsState({
  expandedRows: [['TypeScript']],
  collapsedRows: true,
});

type Config = {
  groupBy: DataSourceGroupBy<Developer>[];
  pivotBy?: DataSourcePivotBy<Developer>[];
};
const noPivotConfig: Config = {
  groupBy: [
    {
      field: 'preferredLanguage',
    },
    { field: 'stack' },
  ],
};
const pivotConfig: Config = {
  ...noPivotConfig,
  pivotBy: [
    { field: 'country' },
    {
      field: 'canDesign',
    },
  ],
};

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function GroupByExample() {
  const [config, setConfig] = React.useState<Config>(noPivotConfig);
  const groupRowsBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => config.groupBy,
    [config],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] | undefined = React.useMemo(
    () => config.pivotBy,
    [config],
  );

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-row-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}
    >
      <div style={{ padding: 10 }}>
        <button onClick={() => setConfig(noPivotConfig)} disabled>
          0. No pivot
        </button>
        &gt;
        <button onClick={() => setConfig(pivotConfig)}>1. Pivot</button>
        &gt;
        <button onClick={() => setConfig(noPivotConfig)}>2. No pivot</button>
        &nbsp;pivotBy is <b>{pivotBy === undefined ? 'not set' : 'set'}</b>
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupRowsBy}
        aggregationReducers={columnAggregations}
        pivotBy={pivotBy}
        defaultGroupRowsState={groupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnDefaultWidth={200}
              pivotTotalColumnPosition="end"
            />
          );
        }}
      </DataSource>
    </div>
  );
}
