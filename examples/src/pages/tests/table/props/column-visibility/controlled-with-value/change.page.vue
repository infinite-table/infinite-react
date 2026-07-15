<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnVisibility } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = {
  make: false,
  year: false,
};

(globalThis as any).calls = [];
const trackColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(columnVisibility);
};

const columnVisibility = ref<InfiniteTablePropColumnVisibility>(
  defaultColumnVisibility,
);

const onColumnVisibilityChange = (
  visibility: InfiniteTablePropColumnVisibility,
) => {
  columnVisibility.value = visibility;
  trackColumnVisibilityChange(visibility);
};

const onReady = ({ api }: { api: any }) => {
  (globalThis as any).api = api;
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};

const fields = ['id', 'make', 'model', 'price'];
</script>

<template>
  <DataSource primaryKey="id" :data="rowData" :fields="fields">
    <InfiniteTable
      :domProps="domProps"
      :columnVisibility="columnVisibility"
      :onColumnVisibilityChange="onColumnVisibilityChange"
      :onReady="onReady"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
