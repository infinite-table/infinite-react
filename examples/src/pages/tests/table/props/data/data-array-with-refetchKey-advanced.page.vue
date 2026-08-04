<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
import type { DataSourceApi } from '@infinite-table/infinite-vue';
import type { CarSale } from '@examples/datasets/CarSale';

const carsales: CarSale[] = [
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 0,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2007,
    sales: 1,
    color: 'red',
    id: 1,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2009,
    sales: 136,
    color: 'blue',
    id: 3,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2010,
    color: 'blue',
    sales: 30,
    id: 4,
  },
];

const columns: Record<string, any> = {
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

const refetchKey = ref(0);

let dataSourceApi: DataSourceApi<CarSale> | null = null;

const onReady = (api: DataSourceApi<CarSale>) => {
  dataSourceApi = api;
};

const onAddItemClick = () => {
  /**
   * make an update so as to store state.originalDataArray
   */
  dataSourceApi!.updateData({
    id: 1,
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
  });

  setTimeout(() => {
    carsales.length = 1;
    // and just after that we refresh the refetchKey
    refetchKey.value = refetchKey.value + 1;
  }, 50);
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <button @click="onAddItemClick">add item</button>

  <DataSource
    :data="carsales"
    primaryKey="id"
    :refetchKey="refetchKey"
    :onReady="onReady"
  >
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
