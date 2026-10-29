import * as React from 'react';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-react';

import {
  Developer,
  lazyUnfilteredColumns,
  lazyUnfilteredDataSource,
} from '../row-selection/lazyUnfilteredServer';

const domProps = {
  style: { height: '80vh' },
};

export default function App() {
  const [groupBy, setGroupBy] = React.useState<
    DataSourcePropGroupBy<Developer>
  >([]);

  (globalThis as any).setGroupBy = setGroupBy;

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={lazyUnfilteredDataSource}
      lazyLoad
      groupBy={groupBy}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columns={lazyUnfilteredColumns}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}
