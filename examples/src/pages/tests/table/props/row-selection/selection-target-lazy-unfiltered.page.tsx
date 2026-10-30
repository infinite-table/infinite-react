import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourcePropMultiRowSelectionTarget,
} from '@infinite-table/infinite-react';

import {
  Developer,
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
  lazyUnfilteredFilterValue,
} from './lazyUnfilteredServer';

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
      lazyLoad
      defaultFilterValue={lazyUnfilteredFilterValue}
      selectionMode="multi-row"
      multiRowSelectionTarget={target}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={lazyUnfilteredColumns}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}
