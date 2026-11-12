// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

{
  //#region configuring-the-selection-mode-to-be-multi-cell
  <DataSource selectionMode="multi-cell" />

  // can be "single-row", "multi-row", "multi-cell" or false
  //#endregion
}

{
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.cellSelectionApi.selectGroupRow(['USA']) // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={[...]}
    onReady={onReady}
  />
  //#endregion
}

export {};
