<script setup lang="ts">
import { CarSale } from '@examples/datasets/CarSale';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

import { carsales } from './common';

const columns: Record<string, any> = {
  make: { field: 'make' },
  model: { field: 'model' },
  color: { field: 'color', dataType: 'color' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    dataType: 'number',
  },
  y: {
    valueGetter: ({ data }: { data: CarSale }) => data.year,
    renderValue: ({ data }: { data: CarSale | null }) => data?.year,
    header: 'Year',
    dataType: 'number',
  },
};

const defaultSortInfo = [
  {
    valueGetter: (data: CarSale) => data.year,
    dir: 1,
    type: 'number',
    id: 'y',
  },
];

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
  >
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
