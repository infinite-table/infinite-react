import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-react';

import {
  Developer,
  getLazyRowCountDataSource,
  lazyRowCountColumns,
} from './lazy-row-count-server';

const dataSources = {
  withRootCount: getLazyRowCountDataSource(true),
  withoutRootCount: getLazyRowCountDataSource(false),
};

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [withRootCount, setWithRootCount] = React.useState(true);
  const [grouped, setGrouped] = React.useState(true);

  (globalThis as any).setWithRootCount = setWithRootCount;
  (globalThis as any).setGrouped = setGrouped;

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSources[withRootCount ? 'withRootCount' : 'withoutRootCount']}
      groupBy={grouped ? groupBy : []}
      lazyLoad
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={lazyRowCountColumns}
        groupRenderStrategy="single-column"
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}
