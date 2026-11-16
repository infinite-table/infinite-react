// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  type DataSourceApi,
} from '@infinite-table/infinite-react';

type DATA_TYPE = {
  id: number;
  name: string;
  children?: DATA_TYPE[];
};

declare const data: DATA_TYPE[];

export function TreeApiFromDataSourceApi() {
  return (
    //#region intro
    <DataSource<DATA_TYPE>
      primaryKey="id"
      data={data}
      onReady={(api: DataSourceApi<DATA_TYPE>) => {
        api.treeApi // <---- // #highlight
        // treeApi is accessible here
        // you may want to store a reference to it in a ref or somewhere in your app state

      }}
    />
    //#endregion
  );
}
