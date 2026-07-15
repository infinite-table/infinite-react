<script setup lang="ts">
import { CarSale } from '@examples/datasets/CarSale';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '900px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource :data="carsales" primaryKey="id">
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
