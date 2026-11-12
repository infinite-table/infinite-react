// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

{
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.rowDetailApi.collapseAllDetails() // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={[...]}
    onReady={onReady}
  />
  //#endregion
}

export {};
