import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import type { DataSourcePivotBy } from '@infinite-table/infinite-react';
import { columns } from './from-pivot-to-normal-data';
import { data, WebFramework } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

type Config = {
  groupBy?: DataSourceGroupBy<WebFramework>[];
  pivotBy?: DataSourcePivotBy<WebFramework>[];
  agg?: DataSourcePropAggregationReducers<WebFramework>;
};
const noPivotConfig: Config = {};
const pivotConfig: Config = {
  ...noPivotConfig,
  groupBy: [
    {
      field: 'license',
    },
    { field: 'language' },
  ],
  pivotBy: [{ field: 'language' }],
  agg: {
    stargazers_count: {
      initialValue: 0,
      field: 'stargazers_count',
      reducer: (acc, row) => acc + row,
    },
    license_count: {
      initialValue: 0,
      field: 'license',
      reducer: (acc) => acc + 1,
    },
  },
};

export default function App() {
  const [config, setConfig] = React.useState<Config>(pivotConfig);
  const groupRowsBy: DataSourceGroupBy<WebFramework>[] = React.useMemo(
    () => config.groupBy || [],
    [config],
  );

  const pivotBy: DataSourcePivotBy<WebFramework>[] | undefined = React.useMemo(
    () => config.pivotBy,
    [config],
  );

  const agg: DataSourcePropAggregationReducers<WebFramework> | undefined =
    React.useMemo(() => config.agg, [config]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}
    >
      <div style={{ padding: 10 }}>
        <button
          disabled={config === noPivotConfig}
          onClick={() => setConfig(noPivotConfig)}
        >
          Switch to no pivot
        </button>

        <button
          disabled={config === pivotConfig}
          onClick={() => setConfig(pivotConfig)}
        >
          Switch to Pivot
        </button>
      </div>
      <DataSource<WebFramework>
        primaryKey="id"
        data={dataSource}
        groupBy={groupRowsBy}
        aggregationReducers={agg}
        pivotBy={pivotBy}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          if (pivotColumns) {
            return (
              <InfiniteTable<WebFramework>
                domProps={domProps}
                // it's intentionally that we're passing an empty object for columns
                columns={{}}
                pivotColumns={pivotColumns}
                pivotColumnGroups={pivotColumnGroups}
                columnDefaultWidth={100}
                pivotTotalColumnPosition="end"
              />
            );
          }
          return (
            <InfiniteTable<WebFramework>
              domProps={domProps}
              columns={columns}
              columnDefaultWidth={100}
            />
          );
        }}
      </DataSource>
    </div>
  );
}
