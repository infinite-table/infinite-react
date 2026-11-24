<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import {
  GRID_HEIGHT,
  GRID_WIDTH,
  ROW_HEIGHT,
  columnGroups,
  columnPinning,
  getColumns,
  rows,
} from './pinnedStartEndData';

const columns = getColumns({ withGroups: true });

const domProps = {
  style: {
    margin: '20px',
    width: `${GRID_WIDTH}px`,
    height: `${GRID_HEIGHT}px`,
    border: '1px solid gray',
  },
};

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
      :columnGroups="columnGroups"
      :onReady="onReady"
    />
  </DataSource>
</template>
