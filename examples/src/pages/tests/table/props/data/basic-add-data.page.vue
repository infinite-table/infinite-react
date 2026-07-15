<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';
import type { CarSale } from '@examples/datasets/CarSale';

import { carsales, carSaleBasicColumns as columns } from './common';

const columns: Record<string, any> = {
  id: { field: 'id', defaultWidth: 80 },
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  count: {
    field: 'sales',
  },
  year: {
    field: 'year',
    type: 'number',
  },
};

let dataSourceApi: DataSourceApi<CarSale> | null = null;

const onReady = (api: DataSourceApi<CarSale>) => {
  dataSourceApi = api;
};

const onInsertClick = () => {
  dataSourceApi?.insertDataArray(
    [
      {
        id: 9,
        make: 'test',
        model: 'test',
        category: 'test',
        year: 2024,
        sales: 1,
        color: 'test',
      },
      {
        id: 10,
        make: 'test',
        model: 'test',
        category: 'test',
        year: 2024,
        sales: 1,
        color: 'test',
      },
    ],
    {
      position: 'after',
      primaryKey: 0,
    },
  );
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
  <button @click="onInsertClick">Insert row after ID=1</button>
  <DataSource :data="carsales" primaryKey="id" :onReady="onReady">
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
