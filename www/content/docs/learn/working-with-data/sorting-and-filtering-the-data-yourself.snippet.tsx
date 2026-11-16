// Snippets shown on sorting-and-filtering-the-data-yourself.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  type DataSourcePropFilterValue,
  type DataSourceSingleSortInfo,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  age: number;
};

export function OwnSortingAndFiltering({ rows }: { rows: Developer[] }) {
  const [sortInfo, setSortInfo] = React.useState<
    DataSourceSingleSortInfo<Developer>[]
  >([]);
  const [filterValue, setFilterValue] = React.useState<
    DataSourcePropFilterValue<Developer>
  >([]);

  return (
    //#region intro
    <DataSource<Developer>
      primaryKey="id"
      data={rows}
      sortInfo={sortInfo}
      onSortInfoChange={setSortInfo}
      filterValue={filterValue}
      onFilterValueChange={setFilterValue}
      shouldReloadData={{ sortInfo: true, filterValue: true }}
    />
    //#endregion
  );
}

//#region reusing-the-built-in-sorting-and-filtering
import {
  defaultFilterFunction,
  filterTypes,
  multisort,
} from '@infinite-table/infinite-react';

function sortAndFilter(
  rows: Developer[],
  sortInfo: DataSourceSingleSortInfo<Developer>[],
  filterValue: DataSourcePropFilterValue<Developer>,
) {
  const filtered = rows.filter((data, index, dataArray) =>
    defaultFilterFunction({
      data,
      index,
      dataArray,
      primaryKey: data.id,
      filterValue,
      filterTypes,
    }),
  );
  return multisort(sortInfo, filtered);
}
//#endregion
