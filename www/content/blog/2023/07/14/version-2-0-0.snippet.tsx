// Snippets shown on version-2-0-0.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTable,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

declare const columns: InfiniteTablePropColumns<Developer>;

export function SortTypeForGroupColumns() {
  return (
    //#region configuring-sorttype-for-group-columns
    <InfiniteTable<Developer>
      groupColumn={{
        sortType: ['string', 'number'],
        field: 'firstName',
        defaultWidth: 150,
      }}
      groupRenderStrategy="single-column"
      columns={columns}
      columnDefaultWidth={120}
    />
    //#endregion
  );
}
