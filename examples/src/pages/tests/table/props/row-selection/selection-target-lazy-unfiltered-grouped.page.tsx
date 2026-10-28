import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropMultiRowSelectionTarget,
} from '@infinite-table/infinite-react';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-react';

import {
  Developer,
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
  lazyUnfilteredFilterValue,
} from './lazyUnfilteredServer';

const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'stack' }];

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [target, setTarget] =
    React.useState<DataSourcePropMultiRowSelectionTarget>('all');

  (globalThis as any).setTarget = setTarget;

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={lazyUnfilteredDataSource}
      groupBy={groupBy}
      lazyLoad
      filterMode="remote"
      defaultFilterValue={lazyUnfilteredFilterValue}
      selectionMode="multi-row"
      useGroupKeysForMultiRowSelection
      multiRowSelectionTarget={target}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={lazyUnfilteredColumns}
        groupRenderStrategy="single-column"
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}
