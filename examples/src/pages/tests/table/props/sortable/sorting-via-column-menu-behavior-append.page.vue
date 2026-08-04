<script setup lang="ts">
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';

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
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/developers100-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: Record<string, any> = {
  firstName: { field: 'firstName' },

  country: { field: 'country' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },

  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

const domProps = { style: { height: '90vh' } };

const defaultSortInfo = [
  { field: 'country' as const, dir: -1 },
  { field: 'salary' as const, dir: 1 },
];

const shouldReloadData = {
  sortInfo: false,
};
</script>

<template>
  <DataSource
    primaryKey="id"
    :data="dataSource"
    :defaultSortInfo="defaultSortInfo"
    :shouldReloadData="shouldReloadData"
  >
    <InfiniteTable
      :domProps="domProps"
      multiSortBehavior="append"
      :columns="columns"
      :columnDefaultWidth="120"
    />
  </DataSource>
</template>
