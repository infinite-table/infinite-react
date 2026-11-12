// Snippets shown on shadcn-ui-theme-available.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

//#region intro
import '@infinite-table/infinite-react/index.css';

<div className="infinite-theme-name--shadcn dark">
  <DataSource  {...}>
    <InfiniteTable {...} />
  </DataSource>
</div>
//#endregion

export {};
