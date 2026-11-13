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

export function KeyboardNavigationMode() {
  //#region configuring-the-keyboard-navigation-to-be-cell
  <InfiniteTable columns={columns} keyboardNavigation="cell" />

  // can be "cell" (default), "row" or false
  //#endregion
  return null;
}

export function KeyboardNavigationApi() {
  //#region intro

  const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
    // do something with it
    api.keyboardNavigationApi.gotoCell({direction: 'top'}) // #highlight
  }

  <InfiniteTable<DATA_TYPE>
    columns={columns}
    onReady={onReady}
  />
  //#endregion
  return null;
}
