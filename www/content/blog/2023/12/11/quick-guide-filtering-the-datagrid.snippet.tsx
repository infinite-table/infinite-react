// Snippets shown on quick-guide-filtering-the-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

declare const data: Developer[];

export function InitialFilterValue() {
  return (
    //#region specifying-an-initial-filter-value-for-the
    <DataSource<Developer>
      data={data}
      primaryKey="id"
      // #highlight
      defaultFilterValue={[{
        field: 'salary',
        filter: {
          operator: 'gt',
          value: 50000,
          type: 'number',
        },
      }]}
      // #endhighlight
    />
    //#endregion
  );
}
