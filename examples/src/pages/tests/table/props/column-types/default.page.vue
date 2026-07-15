<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import {
  columns,
  columnTypes,
  columnTypesDomProps,
  developers10DataSource,
} from './common';

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};
</script>

<template>
  <DataSource primaryKey="id" :data="developers10DataSource">
    <InfiniteTable
      :domProps="columnTypesDomProps"
      :onReady="onReady"
      :columnTypes="columnTypes"
      :columnDefaultWidth="400"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
