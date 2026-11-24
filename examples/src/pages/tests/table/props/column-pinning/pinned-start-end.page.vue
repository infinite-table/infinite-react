<script setup lang="ts">
import { ref, computed } from 'vue';
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  ROW_HEIGHT,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns();

const size = ref({ width: GRID_WIDTH, height: GRID_HEIGHT });
(globalThis as any).setGridSize = (width: number, height: number) => {
  size.value = { width, height };
};

const domProps = computed(() => ({
  style: {
    margin: '20px',
    width: `${size.value.width}px`,
    height: `${size.value.height}px`,
    border: '1px solid gray',
  },
}));

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};
</script>

<template>
  <DataSource primaryKey="id" :data="rows">
    <InfiniteTable
      :domProps="domProps"
      :rowHeight="ROW_HEIGHT"
      :columnPinning="columnPinning"
      :columns="columns"
      :onReady="onReady"
    />
  </DataSource>
</template>
