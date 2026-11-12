// Snippets shown on quick-guide-filtering-the-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
} from '@infinite-table/infinite-react';

{
  //#region specifying-an-initial-filter-value-for-the
  <DataSource<Developer>
    data={...}
    primaryKey="id"
    // #highlight
    defaultFilterValue={[
      field: 'salary',
      filter: {
        operator: 'gt',
        value: 50000,
        type: 'number',
      },
    ]}
    // #endhighlight
  />
  //#endregion
}

export {};
