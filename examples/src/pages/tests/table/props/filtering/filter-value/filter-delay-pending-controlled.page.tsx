import * as React from 'react';

import {
  DataSource,
  DataSourceFilterValueItem,
  InfiniteTable,
} from '@infinite-table/infinite-react';

import {
  Developer,
  FILTER_DELAY,
  columns,
  developers,
  domProps,
  recordFilterValueChange,
} from './filter-delay-pending.data';

export default function FilterDelayPendingControlledPage() {
  const [filterValue, setFilterValue] = React.useState<
    DataSourceFilterValueItem<Developer>[]
  >([]);

  // a view or a restored state replacing the filters - called by the spec
  (globalThis as any).setFilterValue = setFilterValue;

  return (
    <DataSource<Developer>
      data={developers}
      primaryKey="id"
      filterValue={filterValue}
      onFilterValueChange={(filterValue) => {
        recordFilterValueChange(filterValue);
        setFilterValue(filterValue);
      }}
      filterDelay={FILTER_DELAY}
    >
      <InfiniteTable<Developer>
        domProps={domProps}
        columnDefaultWidth={200}
        columns={columns}
      />
    </DataSource>
  );
}
