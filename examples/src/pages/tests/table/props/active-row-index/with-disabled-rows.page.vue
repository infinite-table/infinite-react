<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import {
  activeRowDomProps,
  disabledRowColumns,
  developers10DataSource,
} from './common';

const activeRowIndex = ref(0);

(globalThis as any).activeRowIndex = activeRowIndex.value;

const onActiveRowIndexChange = (index: number) => {
  activeRowIndex.value = index;
  (globalThis as any).activeRowIndex = index;
};

const rowDisabledState = {
  enabledRows: true as const,
  disabledRows: [3, 5, 6],
};

const defaultRowSelection = {
  selectedRows: [5, 6, 7, 8],
  defaultSelection: false,
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="developers10DataSource"
    selectionMode="multi-row"
    :rowDisabledState="rowDisabledState"
    :defaultRowSelection="defaultRowSelection"
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
