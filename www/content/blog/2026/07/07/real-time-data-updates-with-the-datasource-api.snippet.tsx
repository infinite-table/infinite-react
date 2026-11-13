// Snippets shown on real-time-data-updates-with-the-datasource-api.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
  currency: string;
  reposCount: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function dataSourceOnReady() {
  //#region the-datasource-api-owns-row-updates
  const onReady = (dataSourceApi: DataSourceApi<Developer>) => {
    // store the dataSourceApi and use it when updates arrive
  };

  <DataSource primaryKey="id" data={data} onReady={onReady} />;
  //#endregion
}

export function infiniteTableOnReady() {
  //#region infinite-table-on-ready
  const onReady: InfiniteTableProps<Developer>['onReady'] = ({ api, dataSourceApi }) => {
    // api controls grid behavior
    // dataSourceApi controls data updates
  };

  <DataSource primaryKey="id" data={data}>
    <InfiniteTable columns={columns} onReady={onReady} />
  </DataSource>;
  //#endregion
}

export function updateOneRow(dataSourceApi: DataSourceApi<Developer>) {
  //#region update-one-row-by-primary-key
  dataSourceApi.updateData({ // #highlight
    id: 42,
    salary: 124000, // #highlight
    currency: 'USD',
    reposCount: 37,
  });
  //#endregion
}

export function updateManyRows(dataSourceApi: DataSourceApi<Developer>) {
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

export function batchedUpdates(dataSourceApi: DataSourceApi<Developer>) {
  //#region batched-updates
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
