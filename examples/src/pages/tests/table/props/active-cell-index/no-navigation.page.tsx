import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  columns,
  developers100DataSource,
  height800DomProps,
  type Developer,
} from './common';

export default function KeyboardNavigationForRows() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={developers100DataSource as DataSourceData<Developer>}
    >
      <InfiniteTable<Developer>
        columns={columns}
        keyboardNavigation={false}
        domProps={height800DomProps}
      />
    </DataSource>
  );
}
