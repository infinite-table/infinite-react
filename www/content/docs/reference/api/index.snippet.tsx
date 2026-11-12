// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSourceApi,
  InfiniteTable,
  InfiniteTableApi,
} from '@infinite-table/infinite-react';

{
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
    columns={[...]}
    onReady={onReady}
  />
  //#endregion
}

{
  //#region collapsegrouprow
  api.collapseGroupRow(['USA', 'New York']); // collapses the group with these keys
  //#endregion
}

{
  //#region expandgrouprow
  api.expandGroupRow(['USA', 'New York']); // expands the group with these keys
  //#endregion
}

{
  //#region scrollleft
  // use as setter - will scroll the table viewport
  api.scrollLeft = 200;

  // use as getter to read the current scroll left value
  const scrollLeft = api.scrollLeft;
  //#endregion
}

{
  //#region scrolltop
  // use as setter - will scroll the table viewport
  api.scrollTop = 1200;

  // use as getter to read the current scroll top value
  const scrollTop = api.scrollTop;
  //#endregion
}

{
  //#region setcolumnorder
  api.setColumnOrder(['id', 'firstName', 'age']);
  // restore default order
  api.setColumnOrder(true);
  //#endregion
}

{
  //#region togglegrouprow
  api.toggleGroupRow(['USA', 'New York']); // toggle the group with these keys
  //#endregion
}

export {};
