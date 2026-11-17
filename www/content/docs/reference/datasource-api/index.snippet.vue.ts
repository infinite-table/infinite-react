// Code shown on the Vue version of index.page.md: the sibling of
// index.snippet.tsx, with the same `#region` names (the regions that are the
// same code for React and Vue are shown from the .tsx file).
// Type-checked with vue-tsc against the current source.
import type {
  DataSourceApi,
  InfiniteTableApi,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  name: string;
  age: number;
};

// the page calls the type of the rows `DATA_TYPE`
type DATA_TYPE = Developer;

export function dataSourceOnReady() {
  //#region intro
  const onReady = (api: DataSourceApi<DATA_TYPE>) => {
    // api is accessible here // #highlight
    // you may want to store it in a shallowRef, to use it later
  };

  // <DataSource primaryKey="id" :data="data" :onReady="onReady" />
  //#endregion
  return onReady;
}

export function infiniteTableOnReady() {
  //#region intro-infinitetable-onready
  const onReady = ({
    api, // #highlight
    dataSourceApi, // #highlight
  }: {
    api: InfiniteTableApi<DATA_TYPE>;
    dataSourceApi: DataSourceApi<DATA_TYPE>;
  }) => {
    // both api and dataSourceApi are accessible here
  };

  // <InfiniteTable :columns="columns" :onReady="onReady" />
  //#endregion
  return onReady;
}
