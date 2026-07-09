<script setup lang="ts">
import { CarSale } from '@examples/datasets/CarSale';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

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
