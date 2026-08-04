<script setup lang="ts">
import { ref } from 'vue';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { columns } from '../columns';
import { rowData } from '../rowData';

const cols = ref(columns);

const hideIdAndMake = () => {
  const newCols = {
    ...columns,
  };
  //@ts-ignore
  delete newCols.id;
  //@ts-ignore
  delete newCols.make;
  cols.value = newCols;
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
  <button @click="hideIdAndMake">hide id and make columns</button>
  <DataSource primaryKey="id" :data="rowData" :fields="fields">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="cols"
    />
  </DataSource>
</template>
