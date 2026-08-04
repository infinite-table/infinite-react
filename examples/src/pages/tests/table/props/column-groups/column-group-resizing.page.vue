<script setup lang="ts">
import { InfiniteTable, DataSource } from '@infinite-table/infinite-vue';

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

const columns: Record<string, any> = {
  currency: {
    field: 'currency',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  salary: {
    field: 'salary',
    columnGroup: 'finance',
    maxWidth: 130,
  },
  country: {
    field: 'country',
    columnGroup: 'regionalInfo',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    columnGroup: 'regionalInfo',
  },
  id: { field: 'id', defaultWidth: 80 },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
};

const columnGroups: Record<string, any> = {
  regionalInfo: {
    header: 'Regional Info',
  },
  finance: {
    header: 'Finance',
    columnGroup: 'regionalInfo',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: '80vh',
    width: '80vw',
    border: '1px solid gray',
    position: 'relative' as const,
  },
};
</script>

<template>
  <DataSource primaryKey="id" :data="dataSource">
    <InfiniteTable
      :domProps="domProps"
      :columnGroups="columnGroups"
      :columns="columns"
      :columnDefaultWidth="100"
    />
  </DataSource>
</template>
