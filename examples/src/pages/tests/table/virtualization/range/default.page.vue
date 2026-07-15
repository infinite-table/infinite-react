<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type {
  InfiniteTableApi,
  InfiniteTablePropColumnOrder,
} from '@infinite-table/infinite-vue';

import { rowData, Car } from './rowData';
import { columns } from './columns';

(globalThis as any).calls = [];
const onColumnOrderChange = (columnOrder: InfiniteTablePropColumnOrder) => {
  (globalThis as any).calls.push(columnOrder);
};

const height = ref(350);

const onReady = ({ api }: { api: InfiniteTableApi<Car> }) => {
  (globalThis as any).api = api;
};

const fields = ['id', 'make', 'model', 'price'] as const;

const domProps = {
  style: {
    margin: '5px',
    // height: '80vh',
    height: '350px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  current height {{ height }}
  <button @click="height = height - 40">height -= 40</button>
  <DataSource primaryKey="id" :data="rowData" :fields="fields">
    <InfiniteTable
      :domProps="domProps"
      :header="true"
      :virtualizeColumns="true"
      :onColumnOrderChange="onColumnOrderChange"
      :onReady="onReady"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
