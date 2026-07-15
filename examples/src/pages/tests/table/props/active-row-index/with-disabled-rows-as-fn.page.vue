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

const isRowDisabled = (rowInfo: any) =>
  rowInfo.indexInAll === 3 ||
  rowInfo.indexInAll === 5 ||
  rowInfo.indexInAll === 6;
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="developers10DataSource"
    selectionMode="multi-row"
    :isRowDisabled="isRowDisabled"
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
