<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnOrder } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

const defaultColumnOrder = ['id', 'model', 'price'];

const columnOrder = ref<InfiniteTablePropColumnOrder>(defaultColumnOrder);

const onColumnOrderChange = (order: InfiniteTablePropColumnOrder) => {
  columnOrder.value = order;
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
      :columnOrder="columnOrder"
      :onColumnOrderChange="onColumnOrderChange"
      :onReady="onReady"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
