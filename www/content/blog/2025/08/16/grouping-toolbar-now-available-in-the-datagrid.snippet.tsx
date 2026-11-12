// Snippets shown on grouping-toolbar-now-available-in-the-datagrid.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region base-structure-for-using-the-grouping-toolbar
  <DataSource>
    <InfiniteTable>
      <InfiniteTable.GroupingToolbar /> // #highlight
      <InfiniteTable.Header />
      <InfiniteTable.Body />
    </InfiniteTable>
  </DataSource>
  //#endregion
}

{
  //#region example-structure-for-vertical-grouping-toolbar
  <DataSource>
    <InfiniteTable>
      <div className="flex flex-1 flex-row">
        <div className="flex-1 flex flex-col">
          <InfiniteTable.Header />
          <InfiniteTable.Body />
        </div>
        <InfiniteTable.GroupingToolbar orientation="vertical" /> // #highlight
      </div>
    </InfiniteTable>
  </DataSource>
  //#endregion
}

export {};
