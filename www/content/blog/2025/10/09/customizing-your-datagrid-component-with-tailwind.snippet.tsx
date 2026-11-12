// Snippets shown on customizing-your-datagrid-component-with-tailwind.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region default-structure-of-infinitetable
  <DataSource>
    <InfiniteTable />
  </DataSource>
  //#endregion
}

{
  //#region infinitetable-can-be-nested-anywhere-inside-the
  <DataSource>
    <h1>Your DataGrid</h1>
    <App>
      <InfiniteTable /> // #highlight
    </App>
  </DataSource>
  //#endregion
}

{
  //#region example-structure-for-vertical-grouping-toolbar
  <DataSource>
    <InfiniteTable>
      <div className="flex flex-1 flex-row">
        <div className="flex flex-1 flex-col">
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
