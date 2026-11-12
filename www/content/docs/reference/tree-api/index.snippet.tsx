// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourceApi,
} from '@infinite-table/infinite-react';

{
  //#region intro
  <DataSource<DATA_TYPE>
    onReady={(api: DataSourceApi<DATA_TYPE>) => {
      api.treeApi // <---- // #highlight
      // treeApi is accessible here
      // you may want to store a reference to it in a ref or somewhere in your app state

    }}
  />
  //#endregion
}

export {};
