// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type DATA_TYPE = {
  id: number;
  firstName: string;
  country: string;
};

declare const data: DATA_TYPE[];
declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

export function SelectionMode() {
  //#region configuring-the-selection-mode-to-be-multi-cell
  <DataSource primaryKey="id" data={data} selectionMode="multi-cell" />

  // can be "single-row", "multi-row", "multi-cell" or false
  //#endregion
  return null;
}

export function CellSelectionApi() {
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.cellSelectionApi.selectColumn('country') // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={columns}
    onReady={onReady}
  />
  //#endregion
  return null;
}
