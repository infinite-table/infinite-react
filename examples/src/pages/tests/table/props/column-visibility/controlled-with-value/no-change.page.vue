<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnVisibility } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = {
  year: false,
};
(globalThis as any).calls = [];
const onColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(columnVisibility);
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
      :columnVisibility="defaultColumnVisibility"
      :onColumnVisibilityChange="onColumnVisibilityChange"
      :onReady="onReady"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
