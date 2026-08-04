<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import { rowData } from '../rowData';
import { columns } from '../columns';

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
      :columnDefaultWidth="140"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
