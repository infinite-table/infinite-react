<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnOrder } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

const defaultColumnOrder: InfiniteTablePropColumnOrder = [
  'id',
  'model',
  'price',
  'year',
];

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: InfiniteTablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
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
      :defaultColumnOrder="defaultColumnOrder"
      :onColumnOrderChange="onColumnOrderChange"
      :onReady="onReady"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
