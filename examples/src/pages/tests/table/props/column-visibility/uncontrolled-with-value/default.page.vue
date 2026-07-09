<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnVisibility } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

const defaultColumnVisibility: InfiniteTablePropColumnVisibility = {
  make: false,
  year: false,
  id: false,
};
(globalThis as any).calls = [];

const onColumnVisibilityChange = (
  columnVisibility: InfiniteTablePropColumnVisibility,
) => {
  (globalThis as any).calls.push(columnVisibility);
};

const onlyHideId = () => {
  ((globalThis as any).api as any).setColumnVisibility({ id: false });
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

const fields = ['id', 'make', 'model', 'price', 'year'];
</script>

<template>
  <button @click="onlyHideId">only hide id</button>
  <DataSource primaryKey="id" :data="rowData" :fields="fields">
    <InfiniteTable
      :domProps="domProps"
      :defaultColumnVisibility="defaultColumnVisibility"
      :onColumnVisibilityChange="onColumnVisibilityChange"
      :onReady="onReady"
      :columnDefaultWidth="100"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
