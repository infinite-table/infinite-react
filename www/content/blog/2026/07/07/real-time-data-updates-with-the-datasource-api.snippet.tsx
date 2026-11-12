// Snippets shown on real-time-data-updates-with-the-datasource-api.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region the-datasource-api-owns-row-updates
  const onReady = (dataSourceApi) => {
    // store the dataSourceApi and use it when updates arrive
  };

  <DataSource onReady={onReady} />;
  //#endregion
}

{
  //#region the-datasource-api-owns-row-updates-2
  const onReady = ({ api, dataSourceApi }) => {
    // api controls grid behavior
    // dataSourceApi controls data updates
  };

  <DataSource primaryKey="id" data={data}>
    <InfiniteTable onReady={onReady} />
  </DataSource>;
  //#endregion
}

{
  //#region update-one-row-by-primary-key
  dataSourceApi.updateData({ // #highlight
    id: 42,
    salary: 124000, // #highlight
    currency: 'USD',
    reposCount: 37,
  });
  //#endregion
}

{
  //#region update-many-rows-without-creating-render-noise
  dataSourceApi.updateDataArray([ // #highlight
    {
      id: 42, // #highlight
      salary: 124000,
      currency: 'USD',
    },
    {
      id: 73,
      salary: 118500, // #highlight
      currency: 'EUR',
    },
  ]);
  //#endregion
}

{
  //#region update-many-rows-without-creating-render-noise-2
  const firstUpdate = dataSourceApi.updateData({
    id: 1,
    salary: 115000,
  });

  const secondUpdate = dataSourceApi.updateData({
    id: 2,
    salary: 99000,
  });

  firstUpdate === secondUpdate; // true
  //#endregion
}

export {};
