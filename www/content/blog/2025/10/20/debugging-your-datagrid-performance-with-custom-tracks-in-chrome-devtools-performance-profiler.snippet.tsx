// Snippets shown on debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region specify-the-debugid-prop-to-see-the-datagrid-in
  <DataSource>
    <InfiniteTable
      debugId="your-datagrid" // #highlight
    />
  </DataSource>
  //#endregion
}

export {};
