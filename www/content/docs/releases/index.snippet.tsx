// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type DataSourcePropSortInfo,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Person = {
  id: number;
  name: string;
  team: string;
  age: number;
};

declare const fetchRows: DataSourceData<Person>;
declare const sortInfo: DataSourcePropSortInfo<Person>;
declare const data: Person[];
declare const columns: InfiniteTablePropColumns<Person>;

export function shouldReloadData() {
  //#region should-reload-data
  // before: implied by the data function / the controlled sortInfo
  <DataSource primaryKey="id" data={fetchRows} sortInfo={sortInfo} />;

  // now
  <DataSource
    primaryKey="id"
    data={fetchRows}
    sortInfo={sortInfo}
    shouldReloadData={{ sortInfo: true, filterValue: true }}
  />
  //#endregion
}

//#region theme-imports
import '@infinite-table/infinite-react/theme/shadcn.css'
import '@infinite-table/infinite-react/theme/balsam.css'
import '@infinite-table/infinite-react/theme/minimalist.css'
import '@infinite-table/infinite-react/theme/ocean.css'
//#endregion

export function GroupColumnSorting() {
  return (
    /* #region improved-group-column-sorting */
    <DataSource<Person>
      primaryKey="id"
      data={data}
      groupBy={[
        // those fields are not bound to actual columns
        {field: 'team'},
        {field: 'age' },
      ]}>
      <InfiniteTable<Person>
        groupColumn={{
          sortType: ['string', 'number'], // <--- allows you to have
          // the group column sortable
        }}
        columns={columns}
    />
    {/* #endregion */}
    </DataSource>
  );
}
