<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import type { InfiniteTablePropColumnOrder } from '@infinite-table/infinite-vue';

import { rowData } from './rowData';
import { columns } from './columns';

const defaultColumnOrder = ['id', 'make', 'year', 'price'];

const columnOrder = ref<InfiniteTablePropColumnOrder>(defaultColumnOrder);

const toggleColumns = () => {
  if (Array.isArray(columnOrder.value) && columnOrder.value.length > 2) {
    columnOrder.value = ['id', 'make'];
  } else {
    columnOrder.value = ['id', 'make', 'year', 'price'];
  }
};

const onColumnOrderChange = (order: InfiniteTablePropColumnOrder) => {
  columnOrder.value = order;
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    width: '50vw',
    border: '1px solid rgb(194 194 194 / 45%)',
    position: 'relative' as const,
  },
};
</script>

<template>
  <div>
    <button @click="toggleColumns">TOGGLE COLUMNS</button>
  </div>
  <DataSource primaryKey="id" :data="rowData">
    <InfiniteTable
      :domProps="domProps"
      :columnOrder="columnOrder"
      :columnDefaultWidth="250"
      :columnMinWidth="150"
      :columns="columns"
      :onColumnOrderChange="onColumnOrderChange"
    />
  </DataSource>
</template>
