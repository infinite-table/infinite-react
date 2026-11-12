// Snippets shown on version-2-0-0.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
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
}

export {};
