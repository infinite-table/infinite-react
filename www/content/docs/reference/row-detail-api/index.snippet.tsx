// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  InfiniteTable,
  type InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type DATA_TYPE = {
  id: number;
  firstName: string;
  country: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

export function RowDetailApi() {
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.rowDetailApi.collapseAllDetails() // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={columns}
    onReady={onReady}
  />
  //#endregion
  return null;
}
