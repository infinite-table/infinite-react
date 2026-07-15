<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type {
  DataSourceApi,
  DataSourceDataFn,
  InfiniteTableApi,
} from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const columns: Record<string, any> = {
  // id: { field: 'id' },
  salary: { field: 'salary' },
  age: { field: 'age' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  lastName: { field: 'lastName' },
  country: { field: 'country' },
  city: { field: 'city' },
  currency: { field: 'currency' },
  stack: { field: 'stack' },
  canDesign: { field: 'canDesign' },
};

const dataSourceFn: DataSourceDataFn<Developer> = ({}) => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql`)
    .then((r) => r.json())
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newData = [...data.data.slice(0, 20)];

          resolve(newData);
        }, 20);
      });
    });
};

const active = [true, true];
const ds = shallowRef<DataSourceDataFn<Developer>>(dataSourceFn);

const showGrid = ref(true);

let dataSourceApi: DataSourceApi<Developer> | null = null;
let api: InfiniteTableApi<Developer> | null = null;

const activeCellIndex = ref<[number, number] | null>([0, 2]);
const header = ref(false);

const onReady = (params: {
  dataSourceApi: DataSourceApi<Developer>;
  api: InfiniteTableApi<Developer>;
}) => {
  dataSourceApi = params.dataSourceApi;
  api = params.api;
};

const onActiveCellIndexChange = (index: [number, number] | null) => {
  activeCellIndex.value = index;
};

const onUpdateClick = () => {
  if (!dataSourceApi || !api) {
    return;
  }

  const { start, end } = api.getVisibleRenderRange();
  const [startRow, startCol] = start;
  const [endRow, endCol] = end;

  const randomRow =
    Math.floor(Math.random() * (endRow - startRow + 1)) + startRow;
  const randomCol =
    Math.floor(Math.random() * (endCol - startCol + 1)) + startCol;

  const [activeRow, activeCol] = activeCellIndex.value || [];

  const updateRow = activeRow ?? randomRow;
  const updateCol = activeCol ?? randomCol;
  const colId = Object.keys(columns)[updateCol];
  const rowId = dataSourceApi.getPrimaryKeyByIndex(updateRow);
  dataSourceApi.updateData({
    [colId]: Math.floor(Math.random() * 10000),
    id: rowId,
  });
};

const onRemoveRowClick = () => {
  if (!dataSourceApi || !api) {
    return;
  }

  const [activeRow] = activeCellIndex.value || [];
  const rowId = dataSourceApi.getPrimaryKeyByIndex(activeRow as number);
  dataSourceApi.removeData({ id: rowId });
};

const onUpdateDataSourceClick = () => {
  ds.value = dataSourceFn.bind(null);
};

const onToggleHeaderClick = () => {
  header.value = !header.value;
};

const onToggleGridClick = () => {
  showGrid.value = !showGrid.value;
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <div class="flex gap-2 items-center justify-center m-1">
    <button @click="onUpdateClick">update</button>
    <button @click="onRemoveRowClick">remove row</button>
    <button @click="onUpdateDataSourceClick">update datasource</button>
    <button @click="onToggleHeaderClick">toggle header</button>
    <button @click="onToggleGridClick">toggle grid</button>
  </div>
  <DataSource v-if="active[0]" :data="ds" primaryKey="id">
    <InfiniteTable
      v-if="showGrid"
      :header="header"
      :onActiveCellIndexChange="onActiveCellIndexChange"
      debugId="test"
      :onReady="onReady"
      :defaultActiveCellIndex="activeCellIndex"
      :domProps="domProps"
      :columns="columns"
    />
  </DataSource>
</template>
