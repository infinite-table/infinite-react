<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
  type Developer,
} from './common';

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
    :data="developers10DataSource"
    selectionMode="multi-row"
    :rowDisabledState="rowDisabledState"
    :onRowDisabledStateChange="onRowDisabledStateChange"
  >
    <InfiniteTable
      :columns="disabledRowColumns"
      :activeRowIndex="activeRowIndex"
      :onActiveRowIndexChange="onActiveRowIndexChange"
      keyboardNavigation="row"
      :domProps="activeRowDomProps"
    />
  </DataSource>
</template>
