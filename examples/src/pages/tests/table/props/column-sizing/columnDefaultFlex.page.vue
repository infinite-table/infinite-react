<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

import type { InfiniteTableColumn } from '@infinite-table/infinite-vue';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};
const columns: Record<string, InfiniteTableColumn<Developer>> = {
  id: { field: 'id', defaultWidth: 400 },
  country: {
    field: 'country',
    type: 'country',
  },
  city: { field: 'city', defaultFlex: 2 },
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
};

const domProps = {
  style: {
    margin: '5px',
    height: '90vh',
    width: '902px',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :domProps="domProps"
      :columnDefaultFlex="1"
      :columnMinWidth="50"
      :columns="columns"
    />
  </DataSource>
</template>
