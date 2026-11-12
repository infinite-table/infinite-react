// Snippets shown on updating-data-in-realtime.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region getting-a-reference-to-the-datasource-api
  const onReady = (dataSourceApi) => {
    // do something with the dataSourceApi
  };

  <DataSource onReady={onReady} />;
  //#endregion
}

{
  //#region getting-a-reference-to-the-datasource-api-2
  const onReady = ({ api, dataSourceApi }) => {
    // note for InfiniteTable.onReady, you get back an object
    // with both the InfiniteTable API (the `api` property)
    // and the DataSource API (the `dataSourceApi` property)
  }

  <DataSource {...}>
    <InfiniteTable onReady={onReady}/>
  </DataSource>
  //#endregion
}

{
  //#region updating-a-single-row-using-datasourceapi
  dataSourceApi.updateData({ // #highlight
    // if the primaryKey is the "id" field, make sure to include it
    id: 1, // #highlight

    // and then include any properties you want to update - in this case, the name and age
    name: 'Bob Blue',
    age: 35,
  });
  //#endregion
}

{
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

{
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

{
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

{
  //#region inserting-rows
  dataSourceApi.insertData({ ... }, { position: 'start'})
  // or insert multiple items via
  dataSourceApi.insertDataArray([{ ... }, { ... }], { position: 'start'})
  //#endregion
}

{
  //#region inserting-rows-2
  dataSourceApi.insertData(
    { /* ... all data properties here */ },
    {
      position: 'before',
      primaryKey: 2 // #highlight
    }
  )
  // or insert multiple items via
  dataSourceApi.insertDataArray([{ ... }, { ... }], {
    position: 'after', // #highlight
    primaryKey: 10
  })
  //#endregion
}

export {};
