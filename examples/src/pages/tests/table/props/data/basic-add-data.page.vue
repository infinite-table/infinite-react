<script setup lang="ts">
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
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2009,
    sales: 14,
    color: 'yellow',
    id: 5,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2010,
    sales: 14,
    color: 'red',
    id: 6,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Audi',
    model: 'A3',
    year: 2009,
    sales: 2,
    color: 'magenta',
    id: 7,
  },
];

(globalThis as any).carsales = carsales;

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
