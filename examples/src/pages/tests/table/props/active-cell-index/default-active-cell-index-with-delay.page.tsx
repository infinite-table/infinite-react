import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  columns,
  defaultActiveCellIndex,
  developers100DataSource,
  height800DomProps,
  type Developer,
} from './common';

export default function KeyboardNavigationForRows() {
  return (
    <DataSource<Developer> primaryKey="id" data={developers100DataSource}>
      <InfiniteTable<Developer>
        columns={columns}
        defaultActiveCellIndex={defaultActiveCellIndex}
        domProps={height800DomProps}
      />
    </DataSource>
  );
}
