<script setup lang="ts">
import { CarSale } from '@examples/datasets/CarSale';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },
  color: { field: 'color' /*, sortType: 'color'*/ },

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

const defaultSortInfo = [
  {
    field: 'color' as const,
    type: 'color',
    dir: 1,
  },
];

const sortTypes = {
  color: (one: string, two: string) => {
    if (one === 'magenta') {
      // magenta comes first
      return -1;
    }
    if (two === 'magenta') {
      // magenta comes first
      return 1;
    }
    return one.localeCompare(two);
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
  <DataSource
    :data="carsales"
    primaryKey="id"
    :defaultSortInfo="defaultSortInfo"
    :sortTypes="sortTypes"
  >
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
