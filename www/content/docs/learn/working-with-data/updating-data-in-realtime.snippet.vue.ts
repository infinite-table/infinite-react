// Code shown on the Vue version of updating-data-in-realtime.page.md: the
// sibling of updating-data-in-realtime.snippet.tsx, with the same `#region`
// names (the regions that are the same code for React and Vue are shown from
// the .tsx file). Type-checked with vue-tsc against the current source.
import type {
  DataSourceApi,
  InfiniteTableProps,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  name: string;
  age: number;
  salary: number;
  stack: string;
};

export function dataSourceOnReady() {
  //#region getting-a-reference-to-the-datasource-api
  const onReady = (dataSourceApi: DataSourceApi<Developer>) => {
    // do something with the dataSourceApi
  };

  // <DataSource primaryKey="id" :data="data" :onReady="onReady" />
  //#endregion
}

export function infiniteTableOnReady() {
  //#region infinite-table-on-ready
  const onReady: InfiniteTableProps<Developer>['onReady'] = ({ api, dataSourceApi }) => {
    // note for InfiniteTable.onReady, you get back an object
    // with both the InfiniteTable API (the `api` property)
    // and the DataSource API (the `dataSourceApi` property)
  }

  // <DataSource v-bind="dataSourceProps">
  //   <InfiniteTable :columns="columns" :onReady="onReady" />
  // </DataSource>
  //#endregion
}
