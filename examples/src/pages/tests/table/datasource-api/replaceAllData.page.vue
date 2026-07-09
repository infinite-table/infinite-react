<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';

type Car = {
  id: number;
  name: string;
  price: number;
};
const cars: Car[] = [
  { id: 0, name: 'Audi', price: 40000 },
  { id: 1, name: 'Volvo', price: 30000 },
  { id: 2, name: 'BMW', price: 25000 },
];
const dataSource = () => {
  return cars;
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'name',
    name: 'Name',
  },
  price: { field: 'price' },
};
const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

const api = ref<DataSourceApi<Car> | null>(null);

const onReady = (dataSourceApi: DataSourceApi<Car>) => {
  api.value = dataSourceApi;
};

const replaceAllData = () => {
  api.value?.replaceAllData([{ id: 10, name: 'Porsche', price: 60000 }]);
};
</script>

<template>
  <button @click="replaceAllData">replaceAllData</button>
  <DataSource :data="dataSource" primaryKey="id" :onReady="onReady">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultWidth="150"
      :columns="columns"
    />
  </DataSource>
</template>
