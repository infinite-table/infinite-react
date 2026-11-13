// Snippets shown on disabled-rows.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type DATA_TYPE = {
  id: string;
  firstName: string;
};

declare const columns: InfiniteTablePropColumns<DATA_TYPE>;

export function InitiallyDisabledRows() {
  return (
    //#region intro
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={[]}
      defaultRowDisabledState={{
        enabledRows: true,
        disabledRows: ['id1', 'id4', 'id5']
      }}
    >
      <InfiniteTable<DATA_TYPE>
        columns={columns}
      />
    </DataSource>
    //#endregion
  );
}

export function enableRows(
  dataSourceApi: DataSourceApi<DATA_TYPE>,
  rowId: string,
  rowIndex: number,
  enabled: boolean,
) {
  //#region using-the-api-to-enable-disable-rows
  dataSourceApi.setRowEnabled(rowId, enabled);
  //#endregion

  //#region set-row-enabled-at
  dataSourceApi.setRowEnabledAt(rowIndex, enabled);
  //#endregion
}
