import * as React from 'react';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-react';

import {
  Developer,
  FILTER_DELAY,
  columns,
  developers,
  domProps,
  recordFilterValueChange,
} from './filter-delay-pending.data';

export default function FilterDelayPendingPage() {
  return (
    <DataSource<Developer>
      data={developers}
      primaryKey="id"
      defaultFilterValue={[]}
      filterDelay={FILTER_DELAY}
      onFilterValueChange={recordFilterValueChange}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columnDefaultWidth={200}
        columns={columns}
      />
    </DataSource>
  );
}
