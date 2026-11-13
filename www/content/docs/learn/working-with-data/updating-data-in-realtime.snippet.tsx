// Snippets shown on updating-data-in-realtime.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type DataSourceProps,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  name: string;
  age: number;
  salary: number;
  stack: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;
declare const dataSourceProps: DataSourceProps<Developer>;

export function dataSourceOnReady() {
  //#region getting-a-reference-to-the-datasource-api
  const onReady = (dataSourceApi: DataSourceApi<Developer>) => {
    // do something with the dataSourceApi
  };

  <DataSource<Developer> primaryKey="id" data={data} onReady={onReady} />;
  //#endregion
}

export function infiniteTableOnReady() {
  //#region infinite-table-on-ready
  const onReady: InfiniteTableProps<Developer>['onReady'] = ({ api, dataSourceApi }) => {
    // note for InfiniteTable.onReady, you get back an object
    // with both the InfiniteTable API (the `api` property)
    // and the DataSource API (the `dataSourceApi` property)
  }

  <DataSource {...dataSourceProps}>
    <InfiniteTable columns={columns} onReady={onReady}/>
  </DataSource>
  //#endregion
}

export function updateRows(dataSourceApi: DataSourceApi<Developer>) {
  //#region updating-a-single-row-using-datasourceapi
  dataSourceApi.updateData({ // #highlight
    // if the primaryKey is the "id" field, make sure to include it
    id: 1, // #highlight

    // and then include any properties you want to update - in this case, the name and age
    name: 'Bob Blue',
    age: 35,
  });
  //#endregion

  //#region updating-multiple-rows
  dataSourceApi.updateDataArray([ // #highlight
    {
      id: 1, // if the primaryKey is the "id" field, make sure to include it // #highlight
      name: 'Bob Blue',
      age: 35,
    },
    {
      id: 2, // primaryKey for this row // #highlight
      name: 'Alice Green',
      age: 25,
    },
  ]);
  //#endregion
}

export function batchedUpdates(dataSourceApi: DataSourceApi<Developer>) {
  //#region updates-made-on-the-same-raf-are-batched
  const promise1 = dataSourceApi.updateData({
    id: 1,
    name: 'Bob Blue',
  });

  const promise2 = dataSourceApi.updateDataArray([
    { id: 2, name: 'Alice Green' },
    { id: 3, name: 'John Red' },
  ]);

  promise1 === promise2; // true
  //#endregion
}

export function insertRow(dataSourceApi: DataSourceApi<Developer>) {
  //#region inserting-a-single-row
  dataSourceApi.insertData(
    {
      id: 10,
      name: 'Bob Blue',
      age: 35,
      salary: 12_000,
      stack: 'frontend',
      //...
    },
    {
      position: 'before',
      primaryKey: 2,
    },
  );
  //#endregion
}

// These snippets leave the rows out (`{ /* ... */ }`), so here the rows are
// partial: it's the insert position (the second argument) that is checked.
export function insertPositions(dataSourceApi: DataSourceApi<Partial<Developer>>) {
  //#region inserting-rows
  dataSourceApi.insertData({ /* ... */ }, { position: 'start'})
  // or insert multiple items via
  dataSourceApi.insertDataArray([{ /* ... */ }, { /* ... */ }], { position: 'start'})
  //#endregion

  //#region inserting-rows-before-after
  dataSourceApi.insertData(
    { /* ... all data properties here */ },
    {
      position: 'before',
      primaryKey: 2 // #highlight
    }
  )
  // or insert multiple items via
  dataSourceApi.insertDataArray([{ /* ... */ }, { /* ... */ }], {
    position: 'after', // #highlight
    primaryKey: 10
  })
  //#endregion
}
