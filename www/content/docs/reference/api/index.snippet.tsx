// Code shown on the "Infinite Table API" reference page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  InfiniteTable,
  type DataSourceApi,
  type InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
};

type DATA_TYPE = Developer;

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;
declare const api: InfiniteTableApi<DATA_TYPE>;

export function GettingTheApi() {
  //#region intro
  const onReady = (
    {api, dataSourceApi}: { // #highlight
      api: InfiniteTableApi<DATA_TYPE>,
      dataSourceApi: DataSourceApi<DATA_TYPE>
    }) => {
    // api is accessible here
    // you may want to store a reference to it in a ref or somewhere in your app state
  }

  <InfiniteTable<DATA_TYPE>
    columns={columns}
    onReady={onReady}
  />
  //#endregion
  return null;
}

export function groupRows() {
  //#region collapsegrouprow
  api.collapseGroupRow(['USA', 'New York']); // collapses the group with these keys
  //#endregion

  //#region expandgrouprow
  api.expandGroupRow(['USA', 'New York']); // expands the group with these keys
  //#endregion

  //#region togglegrouprow
  api.toggleGroupRow(['USA', 'New York']); // toggle the group with these keys
  //#endregion
}

export function scrolling() {
  //#region scrollleft
  // use as setter - will scroll the table viewport
  api.scrollLeft = 200;

  // use as getter to read the current scroll left value
  const scrollLeft = api.scrollLeft;
  //#endregion

  //#region scrolltop
  // use as setter - will scroll the table viewport
  api.scrollTop = 1200;

  // use as getter to read the current scroll top value
  const scrollTop = api.scrollTop;
  //#endregion

  return [scrollLeft, scrollTop];
}

export function columnOrder() {
  //#region setcolumnorder
  api.setColumnOrder(['id', 'firstName', 'age']);
  // restore default order
  api.setColumnOrder(true);
  //#endregion
}
