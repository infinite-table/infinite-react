<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnPinning } from '@infinite-table/infinite-vue';

import { rowData } from '../column-visibility/rowData';

const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  make: 'start',
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

const columns = {
  id: { field: 'id' as const }, // index: 0
  make: {
    // index: 1
    field: 'make' as const,
  },
  model: { field: 'model' as const }, // index: 2
  price: { field: 'price' as const }, // index: 3
  year: { field: 'year' as const }, // index: 4
  last: {
    // index: 5
    field: 'id' as const,
    header: 'last',
    renderValue: ({ value }: { value: any }) => {
      return `last - ${value}`;
    },
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '300px',
    width: '800px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <pre style="color: magenta">{{ JSON.stringify(defaultColumnPinning) }}</pre>
  <DataSource primaryKey="id" :data="rowData">
    <InfiniteTable
      :domProps="domProps"
      :columnPinning="defaultColumnPinning"
      :onReady="onReady"
      :columns="columns"
    />
  </DataSource>
</template>
