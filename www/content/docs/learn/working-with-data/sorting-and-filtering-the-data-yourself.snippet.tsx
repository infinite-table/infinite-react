// Snippets shown on sorting-and-filtering-the-data-yourself.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
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
}

//#region reusing-the-built-in-sorting-and-filtering
import {
  defaultFilterFunction,
  filterTypes,
  multisort,
} from '@infinite-table/infinite-react';

function sortAndFilter(rows, sortInfo, filterValue) {
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

export {};
