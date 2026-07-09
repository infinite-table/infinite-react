<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;

  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers10-sql`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  preferredLanguage: { field: 'preferredLanguage' },
  id: { field: 'id' },
  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  canDesign: { field: 'canDesign' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },

  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const activeRowIndex = ref(0);

const rowDisabledState = ref<any>({
  enabledRows: true,
  disabledRows: [3, 5, 6],
});

const dataSourceApi = ref<DataSourceApi<Developer> | null>(null);

(globalThis as any).activeRowIndex = activeRowIndex.value;

const onReady = (api: DataSourceApi<Developer>) => {
  dataSourceApi.value = api;
};

const onActiveRowIndexChange = (index: number) => {
  activeRowIndex.value = index;
  (globalThis as any).activeRowIndex = index;
};

const onRowDisabledStateChange = (s: any) => {
  rowDisabledState.value = s.getState();
};

const disableAllRows = () => {
  dataSourceApi.value?.disableAllRows();
};

const enableAllRows = () => {
  dataSourceApi.value?.enableAllRows();
};

const toggleRow1 = () => {
  if (dataSourceApi.value) {
    const isRowDisabled = dataSourceApi.value.isRowDisabled(1);
    dataSourceApi.value.setRowEnabledAt(1, isRowDisabled);
  }
};

const domProps = {
  autoFocus: true,
  style: {
    height: '800px',
  },
};
</script>

<template>
  <div style="margin-bottom: 10px">
    <button @click="disableAllRows">Disable All Rows</button>
    <button @click="enableAllRows" style="margin-left: 10px">
      Enable All Rows
    </button>
    <button @click="toggleRow1" style="margin-left: 10px">Toggle Row 1</button>
  </div>
  <DataSource
    :onReady="onReady"
    primaryKey="id"
    :data="dataSource"
    selectionMode="multi-row"
    :rowDisabledState="rowDisabledState"
    :onRowDisabledStateChange="onRowDisabledStateChange"
  >
    <InfiniteTable
      :columns="columns"
      :activeRowIndex="activeRowIndex"
      :onActiveRowIndexChange="onActiveRowIndexChange"
      keyboardNavigation="row"
      :domProps="domProps"
    />
  </DataSource>
</template>
