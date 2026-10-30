import {
  DataSource,
  DataSourceSingleSortInfo,
  InfiniteTable,
  InfiniteTableColumn,
  multisort,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { developers, type Developer } from './developers';

// the owner's own rule for sorting names: by length, not alphabetically
const byLength = (a: string, b: string) => a.length - b.length;

const columns: Record<string, InfiniteTableColumn<Developer>> = {
  name: { field: 'name' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
};

const domProps = { style: { height: '80vh' } };

export function ArraySortGrid({ ownerSorts }: { ownerSorts: boolean }) {
  const [sortInfo, setSortInfo] = React.useState<
    DataSourceSingleSortInfo<Developer>[]
  >([]);

  const rows = React.useMemo(
    () =>
      multisort(
        sortInfo.map((info) => ({ ...info, fn: byLength })),
        [...developers],
      ),
    [sortInfo],
  );

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={rows}
      sortInfo={sortInfo}
      onSortInfoChange={setSortInfo}
      shouldReloadData={ownerSorts ? { sortInfo: true } : undefined}
    >
      <InfiniteTable<Developer> columns={columns} domProps={domProps} />
    </DataSource>
  );
}
