// Snippets shown on disabled-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  <DataSource<DATA_TYPE>
    idProperty="id"
    data={[]}
    defaultRowDisabledState={{
      enabledRows: true,
      disabledRows: ['id1', 'id4', 'id5']
    }}
  />
    <InfiniteTable<DATA_TYPE>
      {/* ... */}
    />
  </DataSource>
  //#endregion
}

{
  //#region using-the-api-to-enable-disable-rows
  dataSourceApi.setRowEnabled(rowId, enabled);
  //#endregion
}

{
  //#region using-the-api-to-enable-disable-rows-2
  dataSourceApi.setRowEnabledAt(rowIndex, enabled);
  //#endregion
}

export {};
