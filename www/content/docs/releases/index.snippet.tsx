// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region breaking-changes
  // before: implied by the data function / the controlled sortInfo
  <DataSource data={fetchRows} sortInfo={sortInfo} />

  // now
  <DataSource
    data={fetchRows}
    sortInfo={sortInfo}
    shouldReloadData={{ sortInfo: true, filterValue: true }}
  />
  //#endregion
}

//#region breaking-changes-2
import { defaultFilterFunction } from '@infinite-table/infinite-react';

// before
filterFunction={({ data }) => data.age > 30}

// now, to also apply the column filters
filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
//#endregion

//#region 6-2-0
import '@infinite-table/infinite-react/theme/shadcn.css'
import '@infinite-table/infinite-react/theme/balsam.css'
import '@infinite-table/infinite-react/theme/minimalist.css'
import '@infinite-table/infinite-react/theme/ocean.css'
//#endregion

{
  //#region improved-group-column-sorting
  <DataSource<Person>
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
      ...
  />
  //#endregion
}

export {};
