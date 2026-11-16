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

export function SelectionApi() {
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.rowSelectionApi.selectGroupRow(['USA']) // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={columns}
    onReady={onReady}
  />
  //#endregion
  return null;
}

// The `rowSelection` values that deselect / select all rows,
// each checked as the value of the `DataSource.rowSelection` prop.
export function NoRowsSelected() {
  return (
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={data}
      selectionMode="multi-row"
      rowSelection={
        //#region deselectall
        { defaultSelection: false, selectedRows: []}
        //#endregion
      }
    />
  );
}

export function AllRowsSelected() {
  return (
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={data}
      selectionMode="multi-row"
      rowSelection={
        //#region selectall
        { defaultSelection: true, deselectedRows: []}
        //#endregion
      }
    />
  );
}
