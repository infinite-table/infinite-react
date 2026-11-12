import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';

import type { DataSourcePivotBy } from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumnGroups,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import { data, WebFramework } from './pivot-grouping-example-data';

const dataSource = () => {
  return Promise.resolve(data);
};

const domProps = {
  style: {
    height: '80vh',
  },
};

// two levels of column groups, so the header is three rows tall
const columnGroups: InfiniteTablePropColumnGroups = {
  repo: { header: 'Repository' },
  stats: { header: 'Stats', columnGroup: 'repo' },
};

const columns: InfiniteTablePropColumns<WebFramework> = {
  id: { field: 'id' },
  name: { field: 'name', columnGroup: 'repo' },
  stargazers_count: { field: 'stargazers_count', columnGroup: 'stats' },
  week_issue_change: { field: 'week_issue_change', columnGroup: 'stats' },
  language: { field: 'language' },
};

const groupBy: DataSourceGroupBy<WebFramework>[] = [{ field: 'license' }];
const pivotBy: DataSourcePivotBy<WebFramework>[] = [{ field: 'language' }];
const aggregationReducers: DataSourcePropAggregationReducers<WebFramework> = {
  stargazers_count: {
    initialValue: 0,
    field: 'stargazers_count',
    reducer: (acc, value) => acc + value,
  },
  license_count: {
    initialValue: 0,
    field: 'license',
    reducer: (acc) => acc + 1,
  },
};

type View = 'flat' | 'grouped' | 'pivot';

/**
 * The same <InfiniteTable /> instance goes in and out of pivot mode. It has
 * its own `columnGroups`, which are deeper than the pivot column groups.
 */
export default function App() {
  const [view, setView] = React.useState<View>('flat');
  const pivot = view === 'pivot';

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
        <button onClick={() => setView('flat')}>Flat</button>
        <button onClick={() => setView('grouped')}>Grouped</button>
        <button onClick={() => setView('pivot')}>Pivot</button>
      </div>
      <DataSource<WebFramework>
        primaryKey="id"
        data={dataSource}
        groupBy={view === 'flat' ? undefined : groupBy}
        pivotBy={pivot ? pivotBy : undefined}
        aggregationReducers={pivot ? aggregationReducers : undefined}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<WebFramework>
              domProps={domProps}
              columns={columns}
              columnGroups={columnGroups}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              columnHeaderHeight={40}
              columnDefaultWidth={150}
            />
          );
        }}
      </DataSource>
    </div>
  );
}
