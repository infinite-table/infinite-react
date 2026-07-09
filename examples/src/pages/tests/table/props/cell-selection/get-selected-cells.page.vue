<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableApi,
  DataSourcePropCellSelection_MultiCell,
} from '@infinite-table/infinite-vue';

import {
  columns,
  developers10DataSource,
  height80vhDomProps,
  type Developer,
} from './common';

const _api = ref<InfiniteTableApi<Developer> | null>(null);

const cellSelection: DataSourcePropCellSelection_MultiCell = {
  selectedCells: [
    [2, 'id'],
    [8, 'preferredLanguage'],
    [5, 'stack'],
  ],
  deselectedCells: [[3, 'stack']],
  defaultSelection: false,
};

const onReady = ({ api }: { api: InfiniteTableApi<Developer> }) => {
  _api.value = api;
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="developers10DataSource"
    selectionMode="multi-cell"
    :defaultCellSelection="cellSelection"
  >
    <InfiniteTable
      :onReady="onReady"
      :domProps="height80vhDomProps"
      :columns="columns"
      :keyboardSelection="true"
      keyboardNavigation="cell"
      :columnDefaultWidth="200"
    />
  </DataSource>
</template>
