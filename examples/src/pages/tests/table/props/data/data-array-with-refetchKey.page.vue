<script setup lang="ts">
import { ref } from 'vue';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
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

const onAddItemClick = () => {
  carsales.push({
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 1,
  });
  refetchKey.value = refetchKey.value + 1;
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

  <DataSource :data="carsales" primaryKey="id" :refetchKey="refetchKey">
    <InfiniteTable :domProps="domProps" :columns="columns" />
  </DataSource>
</template>
